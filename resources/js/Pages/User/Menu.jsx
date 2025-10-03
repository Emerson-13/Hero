import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import DeleteButton from "@/Components/DeleteButton";

export default function Menus() {
  const menusProps = usePage().props.menus || { data: [], current_page: 1, per_page: 10, last_page: 1 };
  const menus = menusProps.data || [];
  const categories = usePage().props.categories || [];
  const ingredientsList = usePage().props.ingredients || []; // 👈 must be passed from controller

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [search, setSearch] = useState("");

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: "",
    description: "",
    price: "",
    tax_type: "",
    category_id: "",
    barcode: "",
    ingredients: [], // 👈 for storing selected ingredients
  });

  const openCreate = () => {
    reset();
    setEditingMenu(null);
    setShowFormModal(true);
  };

  const openEdit = (menu) => {
    setEditingMenu(menu);
    setData({
      name: menu.name,
      description: menu.description,
      barcode: item.barcode,
      price: menu.price,
      tax_type: menu.tax_type,
      category_id: menu.category_id,
      ingredients: menu.ingredients || [],
    });
    setShowFormModal(true);
  };

  const addIngredient = () => {
    setData("ingredients", [...data.ingredients, { id: "", quantity: "" }]);
  };

  const removeIngredient = (index) => {
    const updated = [...data.ingredients];
    updated.splice(index, 1);
    setData("ingredients", updated);
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...data.ingredients];
    updated[index][field] = value;
    setData("ingredients", updated);
  };

  const submit = (e) => {
    e.preventDefault();
    if (editingMenu) {
      put(route("menus.update", editingMenu.id), {
        onSuccess: () => {
          reset();
          setShowFormModal(false);
          setEditingMenu(null);
          router.reload();
          alert("Menu updated successfully!");
        },
      });
    } else {
      post(route("menus.store"), {
        onSuccess: () => {
          reset();
          setShowFormModal(false);
          router.reload();
          alert("Menu created successfully!");
        },
      });
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this menu?")) return;
    router.delete(route("menus.destroy", id), {
      onSuccess: () => {
        router.reload();
        alert("Menu deleted successfully.");
      },
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Menus" />
      <div className="py-10 min-h-screen bg-slate-100">
        <div className="max-w-6xl mx-auto space-y-8 px-6">
          <h2 className="text-5xl font-semibold text-gray-800">🍽 Menu List</h2>

          {/* Add Button */}
          <PrimaryButton onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 self-start">
            + Add Menu
          </PrimaryButton> 

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search menus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.get(route("user.menu"), { search }, { preserveState: true, replace: true });
                }
              }}
              className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Form Modal */}
          {showFormModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
                <h2 className="text-lg font-semibold mb-4">{editingMenu ? "Edit Menu" : "Add Menu"}</h2>
                <form onSubmit={submit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput id="name" value={data.name} className="mt-1 block w-full"
                      onChange={(e) => setData("name", e.target.value)} required />
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
                  {/* Description */}
                  <div>
                    <InputLabel htmlFor="description" value="Description" />
                    <TextInput id="description" value={data.description} className="mt-1 block w-full"
                      onChange={(e) => setData("description", e.target.value)} />
                    <InputError message={errors.description} className="mt-2" />
                  </div>

                  {/* Price */}
                  <div>
                    <InputLabel htmlFor="price" value="Price" />
                    <TextInput id="price" type="number" value={data.price} className="mt-1 block w-full"
                      onChange={(e) => setData("price", e.target.value)} />
                    <InputError message={errors.price} className="mt-2" />
                  </div>

                  {/* Tax */}
                  <div>
                    <InputLabel htmlFor="tax_type" value="Tax Type" />
                    <select id="tax_type" value={data.tax_type}
                      onChange={(e) => setData("tax_type", e.target.value)}
                      className="mt-1 block w-full border rounded p-2">
                      <option value="">-- Select Tax Type --</option>
                      <option value="vatable">Vatable</option>
                      <option value="not_vatable">Not Vatable</option>
                      <option value="zero_rated">Zero Rated Tax</option>
                    </select>
                    <InputError message={errors.tax_type} className="mt-2" />
                  </div>

                  {/* Category */}
                  <div>
                    <InputLabel htmlFor="category_id" value="Category" />
                    <select id="category_id" value={data.category_id}
                      onChange={(e) => setData("category_id", e.target.value)}
                      className="mt-1 block w-full border rounded p-2">
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <InputError message={errors.category_id} className="mt-2" />
                  </div>

                  {/* Ingredients Section */}
                  <div>
                    <InputLabel value="Ingredients" />
                    {data.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <select
                          value={ingredient.id}
                          onChange={(e) => handleIngredientChange(index, "id", e.target.value)}
                          className="border rounded p-2 w-1/2"
                        >
                          <option value="">-- Select Ingredient --</option>
                          {ingredientsList.map((ing) => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={ingredient.quantity}
                          onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                          className="border rounded p-2 w-1/4"
                        />
                        <button type="button"
                          onClick={() => removeIngredient(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                          ✕
                        </button>
                      </div>
                    ))}
                    <button type="button"
                      onClick={addIngredient}
                      className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                      + Add Ingredient
                    </button>
                    <InputError message={errors.ingredients} className="mt-2" />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowFormModal(false); setEditingMenu(null); }}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                    <button type="submit" disabled={processing}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      {editingMenu ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">#</th>
                  <th className="border px-4 py-2">Category</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Barcode</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Tax Type</th>
                  <th className="border px-4 py-2">Ingredients</th> {/* ✅ bagong column */}
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menus.length > 0 ? (
                  menus.map((menu, index) => (
                    <tr key={menu.id}>
                      <td className="border px-4 py-2">
                        {index + 1 + (menusProps.current_page - 1) * menusProps.per_page}
                      </td>
                      <td className="border px-4 py-2">{menu.category?.name || "Uncategorized"}</td>
                      <td className="border px-4 py-2">{menu.name}</td>
                      <td className="border px-4 py-2">{menu.barcode}</td>
                      <td className="border px-4 py-2">{menu.description}</td>
                      <td className="border px-4 py-2">₱{Number(menu.price).toFixed(2)}</td>
                      <td className="border px-4 py-2">{menu.tax_type}</td>

                      {/* ✅ Display ingredients + qty */}
                      <td className="border px-4 py-2">
                        {menu.ingredients && menu.ingredients.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {menu.ingredients.map((ing) => (
                              <li key={ing.id}>
                                {ing.name} - <span className="font-semibold">{ing.pivot.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400 italic">No ingredients</span>
                        )}
                      </td>

                      <td className="border px-4 py-2 space-x-2">
                        <button
                          onClick={() => openEdit(menu)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <DeleteButton onClick={() => handleDelete(menu.id)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center px-4 py-2 border">
                      No menus found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {menusProps.last_page > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: menusProps.last_page }, (_, i) => (
                <button key={i} onClick={() => router.get(route("menus.index"), { page: i + 1 }, { preserveState: true })}
                  className={`px-3 py-1 rounded ${menusProps.current_page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
    