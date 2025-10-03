import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import Select from "react-select";
import UploadItemModal from "@/Modal/UploadItemModal";
import DeleteButton from "@/Components/DeleteButton";

export default function Items() {
  const itemsProps = usePage().props.items || { data: [], current_page: 1, per_page: 10, last_page: 1 };
  const items = itemsProps.data || [];
  const categories = usePage().props.categories || [];

  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  const [showFormModal, setShowFormModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [search, setSearch] = useState("");

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: "",
    description: "",
    barcode: "",
    price: "",
    stock: "",
    tax_type: "",
    category_id: "",
  });

  const openCreate = () => {
    reset();
    setEditingItem(null);
    setShowFormModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setData({
      name: item.name,
      description: item.description,
      barcode: item.barcode,
      price: item.price,
      stock: item.stock,
      tax_type: item.tax_type,
      category_id: item.category_id,
    });
    setShowFormModal(true);
  };

  const submit = (e) => {
    e.preventDefault();
    if (editingItem) {
      // update
      put(route("items.update", editingItem.id), {
        onSuccess: () => {
          reset();
          setShowFormModal(false);
          setEditingItem(null);
          router.reload();
          alert("Item updated successfully!");
        },
      });
    } else {
      // create
      post(route("items.store"), {
        onSuccess: () => {
          reset();
          setShowFormModal(false);
          router.reload();
          alert("Item created successfully!");
        },
      });
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    router.delete(route("items.destroy", id), {
      onSuccess: () => {
        router.reload();
        alert("Item deleted successfully.");
      },
    });
  };

  return (
    <AuthenticatedLayout
    >
      <Head title="Items" />
       <div className="py-10 min-h-screen bg-slate-100">
        <div className="max-w-6xl mx-auto space-y-8 px-6">
          <h2 className="text-5xl font-semibold text-gray-800">📦 Item List</h2>
          {/* Insert & Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">📥 Manage Item</h3>
              <p className="text-sm text-gray-600 mb-4">Add or edit items in your list.</p>
              <PrimaryButton onClick={() => setShowUploadModal(true)} className="bg-green-600 hover:bg-green-700 mb-2 self-start">
                Import Items
              </PrimaryButton>
              <PrimaryButton onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 self-start">
                + Add Item
              </PrimaryButton>
            </div>

            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">📤 Export Items</h3>
              <Select
                isMulti
                options={categoryOptions}
                value={categoryOptions.filter((opt) => selectedCategories.includes(opt.value))}
                onChange={(selected) => setSelectedCategories(selected.map((opt) => opt.value))}
              />
              <a
                href={route("export.items.csv", {
                  category_id: selectedCategories.length > 0 ? selectedCategories : undefined,
                })}
                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition mt-4 inline-block"
              >
                Export
              </a>
            </div>
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.get(route("user.items"), { search }, { preserveState: true, replace: true });
                }
              }}
              className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
        </div>
          {/* Form Modal (Add + Edit) */}
          {showFormModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl">
                <h2 className="text-lg font-semibold mb-4">
                  {editingItem ? "Edit Item" : "Add Item"}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                      id="name"
                      value={data.name}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("name", e.target.value)}
                      required
                    />
                    <InputError message={errors.name} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="barcode" value="Barcode" />
                    <TextInput
                      id="barcode"
                      value={data.barcode}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("barcode", e.target.value)}
                      required
                    />
                    <InputError message={errors.barcode} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="description" value="Description" />
                    <TextInput
                      id="description"
                      value={data.description}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("description", e.target.value)}
                    />
                    <InputError message={errors.description} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="stock" value="Stock" />
                    <TextInput
                      id="stock"
                      type="number"
                      value={data.stock}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("stock", e.target.value)}
                    />
                    <InputError message={errors.stock} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="price" value="Price" />
                    <TextInput
                      id="price"
                      type="number"
                      value={data.price}
                      className="mt-1 block w-full"
                      onChange={(e) => setData("price", e.target.value)}
                    />
                    <InputError message={errors.price} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="tax_type" value="Tax Type" />
                   <select
                      id="tax_type"
                      value={data.tax_type}
                      onChange={(e) => setData("tax_type", e.target.value)}
                      className="mt-1 block w-full border rounded p-2"
                    >
                      <option value="">-- Select Tax Type --</option>
                      <option value="vatable">Vatable</option>
                      <option value="vat_exempt">Vat Exempted</option>
                      <option value="zero_rated">Zero Rated Tax</option>
                    </select>
                    <InputError message={errors.tax_type} className="mt-2" />
                  </div>
                  <div>
                    <InputLabel htmlFor="category_id" value="Category" />
                    <select
                      id="category_id"
                      value={data.category_id}
                      onChange={(e) => setData("category_id", e.target.value)}
                      className="mt-1 block w-full border rounded p-2"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <InputError message={errors.category_id} className="mt-2" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFormModal(false);
                        setEditingItem(null);
                      }}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {editingItem ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">#</th>
                  <th className="border px-4 py-2">Category</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Barcode</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Stock</th>
                  <th className="border px-4 py-2">Tax Type</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border px-4 py-2">
                        {index + 1 + (itemsProps.current_page - 1) * itemsProps.per_page}
                      </td>
                      <td className="border px-4 py-2">{item.category?.name || "Uncategorized"}</td>
                      <td className="border px-4 py-2">{item.name}</td>
                      <td className="border px-4 py-2">{item.barcode}</td>
                      <td className="border px-4 py-2">{item.description}</td>
                      <td className="border px-4 py-2">₱{Number(item.price).toFixed(2)}</td>
                      <td className="border px-4 py-2">{Number(item.stock).toFixed(2)}</td>
                      <td className="border px-4 py-2">{item.tax_type}</td>
                      <td className="border px-4 py-2 space-x-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <DeleteButton onClick={() => handleDelete(item.id)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center px-4 py-2 border">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {itemsProps.last_page > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: itemsProps.last_page }, (_, i) => (
                <button
                  key={i}
                  onClick={() => router.get(route("user.items"), { page: i + 1 }, { preserveState: true })}
                  className={`px-3 py-1 rounded ${
                    itemsProps.current_page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          <UploadItemModal show={showUploadModal} onClose={() => setShowUploadModal(false)} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
