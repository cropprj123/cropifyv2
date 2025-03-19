/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import UpdatePassword from "../components/UpdatePassword";
import ApiLoading from "../components/ApiLoading";
import { motion } from "framer-motion";
import { Card, Typography, Divider, Alert } from "@mui/joy";
import { FiEdit2, FiSave, FiX, FiCamera, FiMail, FiUser } from "react-icons/fi";

const Profile = ({ userData }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [editedFormData, setEditedFormData] = useState({
    name: "",
    email: "",
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
  });
  const [backendError, setBackendError] = useState("");
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/v1/users/user");
        const userDataFromApi = response.data.user;
        if (userDataFromApi) {
          setFormData({
            name: userDataFromApi.name,
            email: userDataFromApi.email,
            photo: userDataFromApi.photo || null,
          });
          setEditedFormData({
            name: userDataFromApi.name,
            email: userDataFromApi.email,
            photo: userDataFromApi.photo || null,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));

    if (name === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          email: "Invalid email address",
        }));
      } else {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          email: "",
        }));
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const blob = new Blob([file]);
        setEditedFormData((prevData) => ({
          ...prevData,
          photo: file,
        }));
        setPhotoPreview(URL.createObjectURL(blob));
      } catch (error) {
        console.error("Error creating blob:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editedFormData.name);
      formData.append("email", editedFormData.email);
      formData.append("photo", editedFormData.photo);

      const response = await axios.patch("/api/v1/users/updateme", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData({
        ...formData,
        name: editedFormData.name,
        email: editedFormData.email,
        photo: response.data.data.user.photo,
      });
      setEditMode(false);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setBackendError(error.response.data.message);
      } else {
        console.error("Error submitting form:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedFormData(formData);
    setEditMode(false);
    setBackendError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {loading && <ApiLoading />}
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-green-400 to-blue-500">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white"
                >
                  <img
                    src={
                      userData.user && userData.user.photo
                        ? formData.photo
                        : "/default.png"
                    }
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                {editMode && (
                  <label
                    htmlFor="photo"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <FiCamera className="w-5 h-5 text-gray-600" />
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-900"
                >
                  {formData.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 mt-1"
                >
                  {formData.email}
                </motion.p>
              </div>
              <div className="space-x-4">
                {!editMode ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FiEdit2 className="mr-2" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FiSave className="mr-2" />
                      Save Changes
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {editMode ? (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={editedFormData.name}
                        onChange={handleChange}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={editedFormData.email}
                        onChange={handleChange}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                {backendError && (
                  <Alert color="danger" className="mt-4">
                    {backendError}
                  </Alert>
                )}
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <Card variant="outlined" className="p-6">
                  <Typography level="h6" className="text-gray-600 mb-2">
                    Account Information
                  </Typography>
                  <Divider className="mb-4" />
                  <div className="space-y-4">
                    <div>
                      <Typography level="body2" className="text-gray-500">
                        Name
                      </Typography>
                      <Typography level="body1" className="text-gray-900">
                        {formData.name}
                      </Typography>
                    </div>
                    <div>
                      <Typography level="body2" className="text-gray-500">
                        Email
                      </Typography>
                      <Typography level="body1" className="text-gray-900">
                        {formData.email}
                      </Typography>
                    </div>
                  </div>
                </Card>

                <Card variant="outlined" className="p-6">
                  <Typography level="h6" className="text-gray-600 mb-2">
                    Security
                  </Typography>
                  <Divider className="mb-4" />
                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowUpdatePassword(true)}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Change Password
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {showUpdatePassword && (
        <UpdatePassword onClose={() => setShowUpdatePassword(false)} />
      )}
    </div>
  );
};

Profile.propTypes = {
  userData: PropTypes.object.isRequired,
};

export default Profile;
