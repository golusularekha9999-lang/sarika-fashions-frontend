import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Package,
  IndianRupee,
  Tag,
  Boxes,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./AdminEditProduct.css";
const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://sarika-fashions-backend-rfwh.onrender.com/api'
const IMAGE_FIELDS = ["image", "image2", "image3", "image4"];

const categories = [
  "Kadhi Cotton",
  "Rani Silk Sari",
  "Mini Checks",
  "Silk",
  "Victoria Silk",
  "Linen Mirror",
  "Vajrashakti",
  "Black Apple",
];

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    old_price: "",
    description: "",
    stock: "",
  });

  const [images, setImages] = useState({
    image: "",
    image2: "",
    image3: "",
    image4: "",
  });

  const [imageFiles, setImageFiles] = useState({
    image: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [previewImages, setPreviewImages] = useState({
    image: "",
    image2: "",
    image3: "",
    image4: "",
  });

  // --------------------------------------------------
  // LOAD PRODUCT
  // --------------------------------------------------

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/products/${id}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load product");
      }

      const product = data.product || data;

      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price ?? "",
        old_price: product.old_price ?? "",
        description: product.description || "",
        stock: product.stock ?? "",
      });

      const loadedImages = {
        image: product.image || "",
        image2: product.image2 || "",
        image3: product.image3 || "",
        image4: product.image4 || "",
      };

      setImages(loadedImages);
      setPreviewImages(loadedImages);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // IMAGE HANDLING
  // --------------------------------------------------

  const handleImageChange = (field, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setError("");

    setImageFiles((prev) => ({
      ...prev,
      [field]: file,
    }));

    const localPreview = URL.createObjectURL(file);

    setPreviewImages((prev) => ({
      ...prev,
      [field]: localPreview,
    }));
  };

  const removeImage = (field) => {
    setImageFiles((prev) => ({
      ...prev,
      [field]: null,
    }));

    setImages((prev) => ({
      ...prev,
      [field]: "",
    }));

    setPreviewImages((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // --------------------------------------------------
  // SAVE PRODUCT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.name.trim()) {
        throw new Error("Product name is required.");
      }

      if (!formData.category) {
        throw new Error("Please select a category.");
      }

      if (!formData.price || Number(formData.price) <= 0) {
        throw new Error("Please enter a valid price.");
      }

      if (formData.stock === "" || Number(formData.stock) < 0) {
        throw new Error("Please enter a valid stock quantity.");
      }

      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("old_price", formData.old_price || "");
      data.append("description", formData.description);
      data.append("stock", formData.stock);

      IMAGE_FIELDS.forEach((field) => {
        if (imageFiles[field]) {
          data.append(field, imageFiles[field]);
        } else if (images[field]) {
          data.append(`${field}_url`, images[field]);
        } else {
          data.append(`${field}_url`, "");
        }
      });

      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Admin authentication required. Please login again."
          );
        }

        throw new Error(
          result.message || result.error || "Failed to update product."
        );
      }

      setSuccess("Saree details updated successfully.");

      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="edit-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading saree details...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="edit-product-page">

      {/* HEADER */}
      <div className="edit-page-header">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/admin/products")}
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>

        <div className="header-content">
          <div>
            <span className="header-eyebrow">
              PRODUCT MANAGEMENT
            </span>

            <h1>Edit Saree</h1>

            <p>
              Update product information, pricing, stock and images.
            </p>
          </div>

          <div className="product-id-badge">
            <Package size={16} />
            Product #{id}
          </div>
        </div>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="edit-alert error-alert">
          <AlertCircle size={19} />
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="edit-alert success-alert">
          <CheckCircle2 size={19} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <div className="edit-layout">

          {/* LEFT SIDE */}

          <div className="edit-main-column">

            {/* PRODUCT DETAILS */}

            <section className="edit-card">

              <div className="card-heading">
                <div className="heading-icon">
                  <Tag size={20} />
                </div>

                <div>
                  <h2>Edit Saree Details</h2>
                  <p>
                    Update the information displayed to customers.
                  </p>
                </div>
              </div>

              <div className="form-grid">

                {/* NAME */}

                <div className="form-group full-width">
                  <label>
                    Saree Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter saree name"
                  />
                </div>

                {/* CATEGORY */}

                <div className="form-group">
                  <label>
                    Category <span>*</span>
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STOCK */}

                <div className="form-group">
                  <label>
                    Stock Quantity <span>*</span>
                  </label>

                  <div className="input-with-icon">
                    <Boxes size={18} />

                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* PRICE */}

                <div className="form-group">
                  <label>
                    Selling Price <span>*</span>
                  </label>

                  <div className="input-with-icon">
                    <IndianRupee size={18} />

                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="800"
                    />
                  </div>
                </div>

                {/* OLD PRICE */}

                <div className="form-group">
                  <label>
                    Original / Old Price
                  </label>

                  <div className="input-with-icon">
                    <IndianRupee size={18} />

                    <input
                      type="number"
                      name="old_price"
                      min="0"
                      value={formData.old_price}
                      onChange={handleChange}
                      placeholder="1000"
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div className="form-group full-width">

                  <label>
                    <FileText size={15} />
                    Product Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the saree, fabric, design, occasion, colour and other details..."
                    rows="7"
                  />

                  <div className="character-count">
                    {formData.description.length} characters
                  </div>

                </div>

              </div>

            </section>


            {/* IMAGE SECTION */}

            <section className="edit-card image-card">

              <div className="card-heading">

                <div className="heading-icon image-heading-icon">
                  <ImageIcon size={20} />
                </div>

                <div>
                  <h2>Saree Images</h2>

                  <p>
                    Manage your product gallery. You can replace
                    individual images without changing the others.
                  </p>
                </div>

              </div>


              <div className="image-info-box">
                <ImageIcon size={17} />

                <div>
                  <strong>Premium product photography</strong>

                  <p>
                    Use clear, high-quality images. JPG, JPEG, PNG
                    and WEBP are supported.
                  </p>
                </div>
              </div>


              <div className="image-grid">

                {IMAGE_FIELDS.map((field, index) => {

                  const file = imageFiles[field];
                  const preview = previewImages[field];

                  return (
                    <div
                      className={`image-editor ${
                        index === 0 ? "primary-image" : ""
                      }`}
                      key={field}
                    >

                      <div className="image-editor-header">

                        <div>
                          <span className="image-number">
                            IMAGE {index + 1}
                          </span>

                          {index === 0 && (
                            <span className="primary-badge">
                              Main Image
                            </span>
                          )}
                        </div>

                        {preview && (
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => removeImage(field)}
                            title="Remove image"
                          >
                            <X size={15} />
                          </button>
                        )}

                      </div>


                      <label className="image-dropzone">

                        {preview ? (
                          <img
                            src={preview}
                            alt={`Saree ${index + 1}`}
                          />
                        ) : (
                          <div className="empty-image">

                            <div className="upload-icon">
                              <Upload size={25} />
                            </div>

                            <strong>
                              Upload Image
                            </strong>

                            <span>
                              Click to choose a photo
                            </span>

                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(e) =>
                            handleImageChange(
                              field,
                              e.target.files?.[0]
                            )
                          }
                        />

                        {preview && (
                          <div className="change-image-overlay">
                            <Upload size={18} />
                            Change Image
                          </div>
                        )}

                      </label>

                      {file && (
                        <div className="selected-file">
                          <CheckCircle2 size={14} />
                          New image selected
                        </div>
                      )}

                    </div>
                  );
                })}

              </div>

            </section>

          </div>


          {/* RIGHT SIDE */}

          <aside className="edit-sidebar">

            {/* PREVIEW */}

            <section className="preview-card">

              <div className="preview-header">
                <div>
                  <span>LIVE PREVIEW</span>
                  <h3>Product Gallery</h3>
                </div>

                <ImageIcon size={19} />
              </div>


              <div className="preview-main">

                {previewImages.image ? (
                  <img
                    src={previewImages.image}
                    alt={formData.name}
                  />
                ) : (
                  <div className="preview-empty">
                    <ImageIcon size={35} />
                    <span>No main image</span>
                  </div>
                )}

              </div>


              <div className="preview-thumbnails">

                {IMAGE_FIELDS.slice(1).map((field) => (

                  <div
                    className="preview-thumbnail"
                    key={field}
                  >

                    {previewImages[field] ? (
                      <img
                        src={previewImages[field]}
                        alt=""
                      />
                    ) : (
                      <ImageIcon size={17} />
                    )}

                  </div>

                ))}

              </div>


              <div className="preview-product-info">

                <span className="preview-category">
                  {formData.category || "Category"}
                </span>

                <h4>
                  {formData.name || "Saree Name"}
                </h4>

                <div className="preview-price">

                  <strong>
                    ₹{formData.price || "0"}
                  </strong>

                  {formData.old_price && (
                    <del>
                      ₹{formData.old_price}
                    </del>
                  )}

                </div>

              </div>

            </section>


            {/* PRODUCT STATUS */}

            <section className="status-card">

              <div className="status-title">
                <Package size={18} />
                Product Status
              </div>

              <div className="status-row">

                <span>Stock</span>

                <strong>
                  {formData.stock || 0} units
                </strong>

              </div>

              <div className="status-row">

                <span>Gallery</span>

                <strong>
                  {
                    IMAGE_FIELDS.filter(
                      (field) => previewImages[field]
                    ).length
                  } / 4 images
                </strong>

              </div>

            </section>


            {/* ACTIONS */}

            <section className="action-card">

              <button
                type="submit"
                className="save-product-button"
                disabled={saving}
              >

                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}

              </button>


              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  navigate("/admin/products")
                }
                disabled={saving}
              >
                Cancel
              </button>

            </section>

          </aside>

        </div>

      </form>

    </div>
  );
}
