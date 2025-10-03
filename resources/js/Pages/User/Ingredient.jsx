// resources/js/Pages/User/Ingredients.jsx

import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import DeleteButton from "@/Components/DeleteButton";

export default function Ingredients() {
  const ingredientsProps = usePage().props.ingredients || { data: [], current_page: 1, per_page: 10, last_page: 1 };
  const ingredients = ingredientsProps.data || [];
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [search, setSearch] = useState("");

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: "",
    description: "",
    barcode: "",
    stock: "",
  });

  const openCreate = () => {
    reset();
    setEditingIngredient(null);
    setShowFormModal(true);
  };

  const openEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setData({
      name: ingredient.name,
      description: ingredient.description,
      barcode: ingredient.barcode,
      stock: ingredient.stock,
    });
    setShowFormModal(true);
  };

  const submit = (e) => {
    e.preventDefault();
    if (editingIngredient) {
      put(route("ingredients.update", editingIngredient.id), {
        onSuccess: () => {
          reset();
          setShowFormModal(false);
          setEditingIngredient(null);
          router.reload();
          alert("Ingredient updated successfully!");
        },
      });
    } else {
      post(route("ingredients.store"), {
        onSuccess: () => {
          reset();
          setShowFormModal(false);
          router.reload();
          alert("Ingredient created successfully!");
        },
      });
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this ingredient?")) return;
    router.delete(route("ingredients.destroy", id), {
      onSuccess: () => {
        router.reload();
        alert("Ingredient deleted successfully.");
      },
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Ingredients" />
      <div className="py-10 min-h-screen bg-slate-100">
        <div className="max-w-6xl mx-auto space-y-8 px-6">
          <h2 className="text-5xl font-semibold text-gray-800">🧂 Ingredient List</h2>

          {/* Add Button */}
          <PrimaryButton onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 self-start">
            + Add Ingredient
          </PrimaryButton>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.get(route("user.ingredient"), { search }, { preserveState: true, replace: true });
                }
              }}
              className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Form Modal */}
          {showFormModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
                <h2 className="text-lg font-semibold mb-4">{editingIngredient ? "Edit Ingredient" : "Add Ingredient"}</h2>
                <form onSubmit={submit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput id="name" value={data.name} className="mt-1 block w-full"
                      onChange={(e) => setData("name", e.target.value)} required />
                    <InputError message={errors.name} className="mt-2" />
                  </div>

                  {/* Description */}
                  <div>
                    <InputLabel htmlFor="description" value="Description" />
                    <TextInput id="description" value={data.description} className="mt-1 block w-full"
                      onChange={(e) => setData("description", e.target.value)} />
                    <InputError message={errors.description} className="mt-2" />
                  </div>

                  {/* Barcode */}
                  <div>
                    <InputLabel htmlFor="barcode" value="Barcode" />
                    <TextInput id="barcode" value={data.barcode} className="mt-1 block w-full"
                      onChange={(e) => setData("barcode", e.target.value)} />
                    <InputError message={errors.barcode} className="mt-2" />
                  </div>

                  {/* Stock */}
                  <div>
                    <InputLabel htmlFor="stock" value="Stock" />
                    <TextInput id="stock" type="number" value={data.stock} className="mt-1 block w-full"
                      onChange={(e) => setData("stock", e.target.value)} />
                    <InputError message={errors.stock} className="mt-2" />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowFormModal(false); setEditingIngredient(null); }}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                    <button type="submit" disabled={processing}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      {editingIngredient ? "Update" : "Save"}
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
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Barcode</th>
                  <th className="border px-4 py-2">Stock</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length > 0 ? (
                  ingredients.map((ingredient, index) => (
                    <tr key={ingredient.id}>
                      <td className="border px-4 py-2">{index + 1 + (ingredientsProps.current_page - 1) * ingredientsProps.per_page}</td>
                      <td className="border px-4 py-2">{ingredient.name}</td>
                      <td className="border px-4 py-2">{ingredient.description}</td>
                      <td className="border px-4 py-2">{ingredient.barcode}</td>
                      <td className="border px-4 py-2">{ingredient.stock}</td>
                      <td className="border px-4 py-2 space-x-2">
                        <button onClick={() => openEdit(ingredient)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                        <DeleteButton onClick={() => handleDelete(ingredient.id)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center px-4 py-2 border">No ingredients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {ingredientsProps.last_page > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: ingredientsProps.last_page }, (_, i) => (
                <button key={i} onClick={() => router.get(route("ingredients.index"), { page: i + 1 }, { preserveState: true })}
                  className={`px-3 py-1 rounded ${ingredientsProps.current_page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
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
