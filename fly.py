import base64
import matplotlib
matplotlib.use('Agg')  # Use the 'Agg' backend which does not require a GUI
import matplotlib.pyplot as plt
import io
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import pandas as pd
import cv2
from sklearn.exceptions import InconsistentVersionWarning
import pickle
import warnings
from googletrans import Translator
from ultralytics import YOLO
import json
import requests
import tempfile
import os
from prophet import Prophet
from datetime import datetime
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

warnings.simplefilter("ignore", InconsistentVersionWarning) 

app = Flask(__name__)
CORS(app)  
translator = Translator()

RF_model = joblib.load('crop.joblib')
lg_model = joblib.load('logistic_regression_model.joblib')

disease_model = YOLO('best.pt')  # Crop disease detection model
# Load the dataset
df = pd.read_csv('Crop_recommendation.csv')
desired = pd.read_csv('Crop_NPK.csv')
crop_summary = pd.pivot_table(df, index=['label'], aggfunc='mean')

with open('description.json', 'r') as file:
    fertilizer_dict = json.load(file)
def translate_recursive(obj, dest='mr'):
    if isinstance(obj, dict):
        return {k: translate_recursive(v, dest) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_recursive(item, dest) for item in obj]
    elif isinstance(obj, str):
        # Only translate meaningful strings
        if len(obj) > 1 and not obj.isupper() and not obj.isdigit():
            try:
                return translator.translate(obj, dest=dest).text
            except:
                return obj
    return obj
@app.route('/translate', methods=['POST'])
def translate_endpoint():
    try:
        data = request.json.get('text')
        target_language = request.json.get('lang', 'en')
        
        # Parse JSON if it's a JSON string
        try:
            parsed_data = json.loads(data)
        except:
            parsed_data = data
        
        # Translate the data
        translated_data = translate_recursive(parsed_data, dest=target_language)
        
        return jsonify({
            'original_text': data,
            'translated_text': json.dumps(translated_data)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Load disease information
with open('diseasedescription.json', 'r') as file:
    disease_info = json.load(file)

def get_disease_info(disease_name):
    # Normalize the disease name for comparison
    disease_name = disease_name.strip().lower()
    for disease in disease_info:
        if disease['name'].strip().lower() == disease_name:
            return disease
    return None


@app.route('/detect_crop_disease_video', methods=['POST'])
def detect_crop_disease_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video provided', 'message': 'No video uploaded'}), 400
        
        video_file = request.files['video']
        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        video_file.save(temp_video.name)
        temp_video.close()

        cap = cv2.VideoCapture(temp_video.name)
        if not cap.isOpened():
            return jsonify({'error': 'Failed to open video', 'message': 'Invalid video file'}), 400

        unique_diseases = {}  # Track count, max confidence, and info
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = disease_model.predict(source=frame, conf=0.25)

            for result in results:
                for box in result.boxes:
                    disease_class = disease_model.names[int(box.cls)]
                    confidence = box.conf.item()
                    disease_info = get_disease_info(disease_class)

                    # Update count and max confidence
                    if disease_class in unique_diseases:
                        unique_diseases[disease_class]['count'] += 1
                        if confidence > unique_diseases[disease_class]['max_confidence']:
                            unique_diseases[disease_class]['max_confidence'] = confidence
                    else:
                        unique_diseases[disease_class] = {
                            'count': 1,
                            'max_confidence': confidence,
                            'info': disease_info
                        }

        cap.release()
        os.unlink(temp_video.name)

        # Convert to list and sort by count (descending), then confidence (descending)
        unique_predictions = [
            {
                'disease': disease,
                'count': details['count'],
                'confidence': details['max_confidence'],
                'info': details['info']
            }
            for disease, details in unique_diseases.items()
        ]

        # Sort by most frequent, then by highest confidence
        sorted_predictions = sorted(
            unique_predictions,
            key=lambda x: (-x['count'], -x['confidence'])
        )

        return jsonify({
            'predictions': sorted_predictions,
            'message': 'Crop disease detection from video completed'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e), 'message': 'Crop disease detection from video failed'}), 500

@app.route('/detect_crop_disease', methods=['POST'])
def detect_crop_disease():
    try:
        # Receive base64 encoded image or file upload
        if 'image' in request.files:
            # File upload method
            file = request.files['image']
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif request.json and 'image' in request.json:
            # Base64 encoded image method
            image_base64 = request.json.get('image')
            image_bytes = base64.b64decode(image_base64)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            return jsonify({'error': 'No image provided', 'message': 'No image uploaded'}), 400
        
        # Run inference (assuming disease_model is defined elsewhere)
        results = disease_model.predict(source=image, conf=0.25)
        
        # Prepare response
        disease_predictions = []
        for result in results:
            for box in result.boxes:
                disease_class = disease_model.names[int(box.cls)]
                confidence = box.conf.item()
                disease_info = get_disease_info(disease_class)
                disease_predictions.append({
                    'disease': disease_class,
                    'confidence': float(confidence),
                    'info': disease_info
                })
        
        return jsonify({
            'predictions': disease_predictions,
            'message': 'Crop disease detection completed'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e), 'message': 'Crop disease detection failed'}), 500

# Define the prediction endpoint
@app.route('/predict_crop', methods=['POST'])
def predict_crop():
    try:
        # Get the input data from the request
        input_data = np.array(request.json['data']).reshape(1, -1)
        
        # Make predictions using the loaded model
        prediction = RF_model.predict(input_data)
        # Get the predicted crop name
        predicted_crop = prediction[0]
       
        
        # Filter the dataframe for the predicted crop
        crop_data = desired[desired['Crop'] == predicted_crop]
       
#             # Calculate the differences
        if not crop_data.empty:
            n_diff = crop_data['N'].values[0] - input_data[0][0]
            p_diff = crop_data['P'].values[0] - input_data[0][1]
            k_diff = crop_data['K'].values[0] - input_data[0][2]

#             # Generate keys based on the differences
        key1 = "NHigh" if n_diff < 0 else ("Nlow" if n_diff > 0 else "NNo")
        key2 = "PHigh" if p_diff < 0 else ("Plow" if p_diff > 0 else "PNo")
        key3 = "KHigh" if k_diff < 0 else ("Klow" if k_diff > 0 else "KNo")
       
                    # Get the descriptive data for the keys
        n_desc = fertilizer_dict.get(key1, "")
        p_desc = fertilizer_dict.get(key2, "")
        k_desc = fertilizer_dict.get(key3, "")
      
        # Return the prediction as a JSON response
        return jsonify({'prediction': prediction.tolist(), 'n_desc' : n_desc, 'p_desc' : p_desc, 'k_desc' : k_desc}), 200
    except Exception as e:
        # Handle any errors
        return jsonify({'error': str(e)}), 500




@app.route('/ratinggraph', methods=['GET'])
def rating_graph():
    # Send a GET request to the API
    response = requests.get('http://127.0.0.1:3000/api/v1/reviews')

    # Check if the request was successful
    if response.status_code == 200:
        
        data = response.json()
        
        
        reviews_data = data['data']['data']
        
        # Lists to store extracted data
        cropnames = []
        ratings = []
        
    
        for review in reviews_data:
            cropnames.append(review['crop']['name'])
            ratings.append(review['rating'])
        
        # Create DataFrame
        df = pd.DataFrame({
            'Crop Name': cropnames,
            'Rating': ratings
        })
        
        # Calculate statistics
        rating_stats = df.groupby('Crop Name').agg({'Rating': ['count', 'mean']}).reset_index()
        rating_stats.columns = ['Crop Name', 'Number of Ratings', 'Average Rating']
        
        # Plotting
        fig, ax = plt.subplots()  # Remove figsize here

        # Set the positions for the bars
        bar_width = 0.35
        index = rating_stats.index

        # Plotting the bars
        ax.bar(index, rating_stats['Number of Ratings'], bar_width, label='Number of Ratings')
        ax.bar(index + bar_width, rating_stats['Average Rating'], bar_width, label='Average Rating')

        # Adding labels and title
        ax.set_xlabel('Crop Name')
        ax.set_ylabel('Count / Rating')
        ax.set_title('Number of Ratings and Average Rating for Each Crop')
        ax.set_xticks(index + bar_width / 2)
        ax.set_xticklabels(rating_stats['Crop Name'], rotation=90)
        ax.legend()

        # Adjust layout padding to ensure all labels are visible
        plt.tight_layout()

        # Increase the figure size before saving
        fig.set_size_inches(16, 8)  # Set the desired figure size

        # Save the plot to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        plt.close()

        # Encode the plot as base64
        plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return jsonify({'plot_data': plot_data})
    else:
        return jsonify({'message': 'Failed to fetch data from the API.'})
@app.route('/singlecrop', methods=['POST'])
def single_crop():
    try:
        # Get the input data from the request
        input_data = np.array(request.json['data']).reshape(1, -1)
        
        # Make predictions using the loaded model
        prediction = RF_model.predict(input_data)
       
      
        # Return the prediction as a JSON response
        return jsonify({'prediction': prediction.tolist()}), 200
    except Exception as e:
        # Handle any errors
        return jsonify({'error': str(e)}), 500

@app.route('/predict_fertilizer', methods=['POST'])
def predict_fertilizer():
    try:
        # Get the input data from the request
        input_data = np.array(request.json['data']).reshape(1, -1)
        
        # Make predictions using the loaded model
        prediction = lg_model.predict(input_data)
        
        # Return the prediction as a JSON response
        return jsonify({'prediction': prediction.tolist()}), 200
    except Exception as e:
        # Handle any errors
        return jsonify({'error': str(e)}), 500


@app.route('/ratings', methods=['GET'])
def get_ratings():
    # Send a GET request to the API
    response = requests.get('http://127.0.0.1:3000/api/v1/bookings/getallbooking')

    # Check if the request was successful
    if response.status_code == 200:
        # Convert the JSON response to a Python dictionary
        data = response.json()
        
        # Extract the 'data' field from the response
        booking_data = data['data']['data']
        
        # Initialize empty lists to store data
        crop_names = []
        created_at = []
        prices = []
        
        # Iterate over each booking record and extract the desired fields
        for booking in booking_data:
            crop_names.append(booking['crop']['name'])
            created_at.append(booking['createdAt'])
            prices.append(booking['price'])
        
        # Create DataFrame from the extracted data
        data = pd.DataFrame({
            'Crop Name': crop_names,
            'Created At': created_at,
            'Price': prices
        })
        
        # Group the data by crop name and calculate the total price for each crop
        crop_prices = data.groupby('Crop Name')['Price'].sum().reset_index()
        
 
        
        # Plotting the pie chart
        plt.figure(figsize=(8, 8))
        plt.pie(crop_prices['Price'], labels=crop_prices['Crop Name'], autopct='%1.1f%%', startangle=140)
        plt.axis('equal')
        plt.title('Distribution of Total Price Among Crops')
        plt.tight_layout()
        pie_chart_img = io.BytesIO()
        plt.savefig(pie_chart_img, format='png')
        pie_chart_img.seek(0)
        pie_chart_base64 = base64.b64encode(pie_chart_img.read()).decode('utf-8')
        plt.close()

        # Return the base64 encoded images along with the data
        return jsonify({
            'data': data.to_dict(orient='records'),
            
            'pie_chart': pie_chart_base64
        })
    else:
        return jsonify({'message': 'Failed to fetch data from the API.'})
# Define the chart generation endpoint
@app.route('/get_chart')
def get_chart():
    labels = ['Nitrogen(N)', 'Phosphorous(P)', 'Potash(K)']
    specs = [[{'type': 'domain'}, {'type': 'domain'}, {'type': 'domain'}, {'type': 'domain'}, {'type': 'domain'}],
             [{'type': 'domain'}, {'type': 'domain'}, {'type': 'domain'}, {'type': 'domain'}, {'type': 'domain'}]]
    fig = make_subplots(rows=2, cols=5, specs=specs)
    cafe_colors =  ['#1f77b4', '#ff7f0e', '#2ca02c'] 

    for i, crop in enumerate(['apple', 'banana', 'grapes', 'orange', 'mango', 'coconut', 'papaya', 'pomegranate', 'watermelon', 'muskmelon']):
        crop_npk = crop_summary[crop_summary.index == crop]
        values = [crop_npk['N'][0], crop_npk['P'][0], crop_npk['K'][0]]
        fig.add_trace(go.Pie(labels=labels, values=values, name=crop.capitalize(), marker_colors=cafe_colors), i // 5 + 1, i % 5 + 1)

    fig.update_layout(
        title_text="NPK ratio for fruits",
        annotations=[dict(text=crop.capitalize(), x=0.06 + i % 5 * 0.24, y=1.08 - i // 5 * 0.62, font_size=15, showarrow=False) for i, crop in enumerate(['apple', 'banana', 'grapes', 'orange', 'mango', 'coconut', 'papaya', 'pomegranate', 'watermelon', 'muskmelon'])],
        width=1600,  
        height=800   
    )


    img = io.BytesIO()
    fig.write_image(img, format='png', scale=2)  
    img.seek(0)

   
    base64_img = base64.b64encode(img.read()).decode('utf-8')


    plt.close()


    return jsonify({'image': base64_img})

@app.route('/popular')
def popular():

    response = requests.get('http://127.0.0.1:3000/api/v1/reviews')


    if response.status_code == 200:

        data = response.json()

  
        reviews_data = data['data']['data']


        usernames = []
        cropnames = []
        reviews = []
        ratings = []


        for review in reviews_data:
            cropnames.append(review['crop']['name'])
            usernames.append(review['user']['name'])
            reviews.append(review['review'])
            ratings.append(review['rating'])

        # Create DataFrame
        df = pd.DataFrame({
            'Crop Name': cropnames,
            'User Name': usernames,
            'Review': reviews,
            'Rating': ratings
        })

        # Grouping the data by crop name and calculating the count of ratings and average rating
        rating_stats = df.groupby('Crop Name').agg({'Rating': ['count', 'mean']}).reset_index()
        rating_stats.columns = ['Crop Name', 'Number of Ratings', 'Average Rating']

        # Calculating a combined popularity score based on both number of ratings and average rating
        rating_stats['Popularity Score'] = rating_stats['Number of Ratings'] * rating_stats['Average Rating']

        # Sorting crops based on the popularity score in descending order
        rating_stats = rating_stats.sort_values(by='Popularity Score', ascending=False)

        # Plotting
        plt.figure(figsize=(10, 8))
        bars = plt.barh(rating_stats['Crop Name'], rating_stats['Popularity Score'], color='skyblue', alpha=0.7)

        # Adding popularity score as text on each bar
        for i, bar in enumerate(bars):
            plt.text(bar.get_width() + 0.2, bar.get_y() + bar.get_height()/2, 
                     f"{rating_stats['Popularity Score'].iloc[i]:.2f}", 
                     va='center', ha='left', color='black')

        # Customizing the plot
        plt.xlabel('Popularity Score')
        plt.ylabel('Crop Name')
        plt.title('Most Popular Crops Based on Popularity Score')
        plt.grid(axis='x', linestyle='--', alpha=0.7)

        # Adding rank numbers beside each bar
        for i, bar in enumerate(bars):
            plt.text(5, i, f"{i+1}.", va='center', ha='center', color='black', fontweight='bold')

        plt.tight_layout()

        # Save the plot to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        plt.close()

        # Encode the plot as base64
        plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')

        # Return the plot as an image
        return jsonify({
            'pie_chart': plot_data
        })

    else:
        return jsonify({'message': 'Failed to fetch data from the API.'})

# Add the forecast endpoint
@app.route('/forecast', methods=['POST'])
def forecast():
    try:
        data = request.json
        target_year = int(data.get('year'))
        target_month = int(data.get('month'))
        
        if not target_year or not target_month:
            return jsonify({'error': 'Year and month are required'}), 400
            
        target_date = datetime(target_year, target_month, 1)
        
        # Load and preprocess data
        df = pd.read_excel("uniform_3year_bookings.xlsx")
        df['Date'] = pd.to_datetime(df['Date & Time']).dt.date
        df_aggregated = df.groupby(['Product Name', 'Date']).size().reset_index(name='Sales')
        
        # Forecast for all products
        all_predictions = {}
        products = df_aggregated['Product Name'].unique()
        
        for product in products:
            product_data = df_aggregated[df_aggregated['Product Name'] == product]
            df_prophet = product_data[['Date', 'Sales']].rename(columns={'Date': 'ds', 'Sales': 'y'})
            df_prophet['ds'] = pd.to_datetime(df_prophet['ds'])
            
            # Sanitize product name for filename
            sanitized_product = "".join([c if c.isalnum() else "_" for c in product])
            model_path = f"picklemodels/{sanitized_product}_prophet_model.pkl"
            
            try:
                # Train new model
                model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
                model.fit(df_prophet)
                print(f"Trained model for: {product}")
                
                # Calculate forecast period
                last_date = df_prophet['ds'].max()
                periods = (target_date - last_date).days + 30
                if periods < 0:
                    periods = 30
                
                # Generate forecast
                future = model.make_future_dataframe(periods=periods)
                forecast = model.predict(future)
                
                # Filter predictions for target month
                target_month_data = forecast[
                    (forecast['ds'].dt.month == target_date.month) & 
                    (forecast['ds'].dt.year == target_date.year)
                ]
                total_predicted_sales = target_month_data['yhat'].sum()
                all_predictions[product] = max(0, round(total_predicted_sales))
                
            except Exception as e:
                print(f"Error processing {product}: {str(e)}")
                all_predictions[product] = None
        
        # Calculate restock quantities with 20% buffer
        predictions_df = pd.DataFrame(
            list(all_predictions.items()), 
            columns=['Product', 'Predicted_Sales']
        )
        predictions_df['Restock_Quantity'] = (predictions_df['Predicted_Sales'] * 1.2).round().astype(int)
        predictions_df = predictions_df.sort_values(by='Predicted_Sales', ascending=False)
        
        # Cross-validation for each product
        evaluation_results = {}
        
        for product in products:
            product_data = df_aggregated[df_aggregated['Product Name'] == product]
            
            # Skip products with too little data
            if len(product_data) < 30:
                print(f"Skipping {product} - insufficient data")
                continue
                
            df_prophet = product_data[['Date', 'Sales']].rename(columns={'Date': 'ds', 'Sales': 'y'})
            df_prophet['ds'] = pd.to_datetime(df_prophet['ds'])
            
            # Get the last 20% of data for testing
            cutoff_point = int(len(df_prophet) * 0.8)
            training_data = df_prophet.iloc[:cutoff_point]
            testing_data = df_prophet.iloc[cutoff_point:]
            
            if len(testing_data) < 7:  # Need at least a week of data to test
                print(f"Skipping {product} - insufficient test data")
                continue
            
            # Train on training data
            model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
            model.fit(training_data)
            
            # Predict for the test period
            future = model.make_future_dataframe(periods=len(testing_data))
            forecast = model.predict(future)
            
            # Extract the predictions for the test period
            predictions = forecast.iloc[-len(testing_data):]
            
            # Calculate error metrics
            y_true = testing_data['y'].values
            y_pred = predictions['yhat'].values
            
            mae = mean_absolute_error(y_true, y_pred)
            rmse = np.sqrt(mean_squared_error(y_true, y_pred))
            
            # Handle zeros in MAPE calculation
            nonzero_indices = y_true != 0
            if np.sum(nonzero_indices) > 0:
                mape = mean_absolute_percentage_error(y_true[nonzero_indices], y_pred[nonzero_indices]) * 100
            else:
                mape = np.nan
            
            evaluation_results[product] = {
                'MAE': mae,
                'RMSE': rmse,
                'MAPE': mape
            }
        
        # Calculate overall metrics
        if evaluation_results:
            avg_mae = np.mean([metrics['MAE'] for metrics in evaluation_results.values()])
            avg_rmse = np.mean([metrics['RMSE'] for metrics in evaluation_results.values()])
            avg_mape = np.nanmean([metrics['MAPE'] for metrics in evaluation_results.values()])
        else:
            avg_mae = avg_rmse = avg_mape = None
        
        # Prepare response
        predictions_list = []
        for _, row in predictions_df.iterrows():
            product = row['Product']
            predictions_list.append({
                'product': product,
                'predicted_sales': int(row['Predicted_Sales']),
                'restock_quantity': int(row['Restock_Quantity']),
                'evaluation': evaluation_results.get(product, {
                    'MAE': None,
                    'RMSE': None,
                    'MAPE': None
                })
            })
        
        # Save results to CSV
        output_filename = f"forecast_results_{target_date.strftime('%Y%m')}.csv"
        # predictions_df.to_csv(output_filename, index=False)
        
        return jsonify({
            'target_date': target_date.strftime('%B %Y'),
            'predictions': predictions_list,
            'top_product': predictions_list[0] if predictions_list else None,
            'output_file': output_filename,
            'overall_metrics': {
                'average_mae': float(avg_mae) if avg_mae is not None else None,
                'average_rmse': float(avg_rmse) if avg_rmse is not None else None,
                'average_mape': float(avg_mape) if avg_mape is not None else None
            }
        })
        
    except Exception as e:
        print("Forecast Error:", str(e))  # For debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
