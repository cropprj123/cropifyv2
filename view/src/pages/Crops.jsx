import axios from "axios";
import { useState, useEffect } from "react";
import ApiLoading from "../components/ApiLoading";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import NewProductCard from "../components/NewProductCard";
import { Typography, Slider, Chip } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import TuneIcon from '@mui/icons-material/Tune';

function Crops({ cart, setCart }) {
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(false);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("recently-added");
  const [showFilters, setShowFilters] = useState(false);

  const cropTypes = ["Fertilizer", "Seed", "Crop Protection"];

  useEffect(function () {
    async function getCrops() {
      try {
        setIsLoading(true);
        setError("");
        const response = await axios.get(`/api/v1/crops/`);
        if (response.status !== 200)
          throw new Error("Something went wrong with fetching crops");

        const cropsData = response.data.data.data;
        if (cropsData.length === 0) {
          throw new Error("No crops found");
        }
        setCrops(cropsData);
        setFilteredCrops(cropsData);
        // Set initial price range based on min and max prices
        const prices = cropsData.map(crop => crop.price);
        setPriceRange([Math.min(...prices), Math.max(...prices)]);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getCrops();
  }, []);

  // Apply all filters and sorting
  useEffect(() => {
    let result = [...crops];
    
    // Apply search filter
    if (search) {
      result = result.filter(crop => 
        crop.name.toLowerCase().includes(search.toLowerCase()) ||
        crop.type.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      result = result.filter(crop => selectedTypes.includes(crop.type));
    }

    // Apply price range filter
    result = result.filter(crop => 
      crop.price >= priceRange[0] && crop.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "price-high-to-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "price-low-to-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "recently-added":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredCrops(result);
  }, [crops, search, selectedTypes, priceRange, sortBy]);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setPriceRange([Math.min(...crops.map(c => c.price)), Math.max(...crops.map(c => c.price))]);
    setSearch("");
    setSortBy("recently-added");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {cropTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTypes.includes(type)
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Sort and Advanced Filters */}
            <div className="flex gap-3 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="recently-added">Recently Added</option>
                <option value="price-high-to-low">Price: High to Low</option>
                <option value="price-low-to-high">Price: Low to High</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                <TuneIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Filters</span>
              </button>

              {(selectedTypes.length > 0 || search || sortBy !== "recently-added") && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                >
                  <ClearIcon fontSize="small" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Price Range Filter - Shown when filters are expanded */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Typography variant="subtitle2" className="mb-3 text-gray-600">Price Range</Typography>
              <div className="px-4">
                <Slider
                  value={priceRange}
                  onChange={(_, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={Math.min(...crops.map(c => c.price))}
                  max={Math.max(...crops.map(c => c.price))}
                  sx={{
                    color: '#16a34a',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#16a34a',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#16a34a',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e5e7eb',
                    },
                  }}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {selectedTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedTypes.map(type => (
              <Chip
                key={type}
                label={type}
                onDelete={() => handleTypeToggle(type)}
                color="primary"
                variant="outlined"
                sx={{
                  borderColor: '#16a34a',
                  color: '#16a34a',
                  '& .MuiChip-deleteIcon': {
                    color: '#16a34a',
                  },
                }}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <Typography variant="subtitle1" className="text-gray-600 font-medium">
            {filteredCrops.length} Products Found
          </Typography>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading && <ApiLoading />}
          {!isLoading && error && <ErrorMessage message={error} />}
          {!isLoading && !error && filteredCrops.map((crop) => (
            <div
              key={crop._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Link to={`/crops/${crop._id}`}>
                <NewProductCard
                  cart={cart}
                  cropid={crop._id}
                  setCart={setCart}
                  name={crop.name}
                  image={crop.image}
                  type={crop.type}
                  price={crop.price}
                  description={crop.description}
                  quantity={crop.quantity}
                />
              </Link>
            </div>
          ))}
        </div>

        {/* No Results */}
        {!isLoading && !error && filteredCrops.length === 0 && (
          <div className="text-center py-12">
            <Typography variant="h6" className="text-gray-500">
              No products found matching your criteria
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}

export default Crops;
