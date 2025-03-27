import axios from "axios";
import fertilizer from "../assets/fertilizer.jpeg";
import { useState, useEffect } from "react";
import ApiLoading from "../components/ApiLoading";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import ProductCard from "../components/ProductCard";
import NewProductCard from "../components/NewProductCard";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from "@heroicons/react/24/outline";

function MyOrders() {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("none");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  useEffect(function () {
    async function getCrops() {
      try {
        setIsLoading(true);
        setError("");
        const response = await axios.get(`/api/v1/bookings/mypurchase`);

        if (response.status !== 200)
          throw new Error("Something went wrong with fetching crops");

        const cropsData = response.data.data.crops;
        if (cropsData.length === 0) {
          throw new Error("No orders found");
        }
        setCrops(cropsData);
        setFilteredCrops(cropsData);

        setIsLoading(false);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getCrops();
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let result = [...crops];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(crop => 
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== "all") {
      result = result.filter(crop => crop.type === selectedType);
    }

    // Apply price range filter
    result = result.filter(crop => 
      crop.price >= priceRange.min && crop.price <= priceRange.max
    );

    // Apply sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredCrops(result);
  }, [crops, searchQuery, selectedType, sortBy, priceRange]);

  // Get unique types for filter dropdown
  const types = ["all", ...new Set(crops.map(crop => crop.type))];

  return (
    <div className="bg-white px-6 lg:px-8 h-screen overflow-y-auto">
      {/* Filters Section */}
      <div className="sticky top-0 z-10 bg-white py-4 shadow-md mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Sort by</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>

              {/* Price Range Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto mb-4">
        <p className="text-gray-600">
          Showing {filteredCrops.length} of {crops.length} items
        </p>
      </div>

      {isLoading && <ApiLoading />}
      {!isLoading && error && <ErrorMessage message={error} />}
      {!isLoading && !error && (
        <section className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md-new:grid-cols-4 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">
          {filteredCrops.map((crop) => (
            <div
              className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl"
              key={crop._id}
            >
              <Link to={`/crops/${crop._id}`}>
                <NewProductCard
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
        </section>
      )}

      {/* No Results Message */}
      {!isLoading && !error && filteredCrops.length === 0 && (
        <div className="text-center py-10">
          <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}

export default MyOrders;
