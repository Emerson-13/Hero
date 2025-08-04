import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import CategoryEdit from './CategoryEdit'

export default function Categories() {
   const { categories = []} = usePage().props;
     const [showModal, setShowModal] = useState(false);
     const [editingCategory, setEditingCategory] = useState(null);
     const [showEditModal, setShowEditModal] = useState(false);
     const { data, setData, post, processing, errors, reset } = useForm({
         name: '',
         description: ''
     });
 
     const submit = (e) => {
         e.preventDefault();
 
         post(route('categories.store'), {
             onSuccess: () => {
                 reset();
                 setShowModal(false);
                 router.reload();
                 alert('Category created successfully!');
             },
             onError: () => {
                 console.log(errors);
             },
         });
     };
 
     const handleDelete = (id) => {
         if (!confirm('Are you sure you want to delete this Category?')) return;
 
         router.delete(route('categories.destroy',  id), {
             onSuccess: () => {
                 router.reload();
                 alert('Category deleted successfully.')
             }
         });
     };
 
     return (
         <AuthenticatedLayout
             header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Category</h2>}
         >
             <Head title="Category" />
 
             <div className="py-12">
                 <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                     <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-semibold">Category List</h3>
                             <PrimaryButton onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                                 + Add Category
                             </PrimaryButton>
                         </div>
 
                         {/* Modal */}
                         {showModal && (
                             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                 <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
                                     <h2 className="text-lg font-semibold mb-4">Add Category</h2>
                                     <form onSubmit={submit} className="space-y-4">
                                         <input
                                             type="text"
                                             placeholder="Category Name"
                                             value={data.name}
                                             onChange={(e) => setData('name', e.target.value)}
                                             className="w-full border p-2 rounded"
                                         />
                                         {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
 
                                         <textarea
                                             placeholder="Description"
                                             value={data.description}
                                             onChange={(e) => setData('description', e.target.value)}
                                             className="w-full border p-2 rounded"
                                         />
                                         {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

 
                                         <div className="flex justify-end space-x-2 mt-4">
                                             <button
                                                 type="button"
                                                 onClick={() => setShowModal(false)}
                                                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                             >
                                                 Cancel
                                             </button>
                                             <button
                                                 type="submit"
                                                 disabled={processing}
                                                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                             >
                                                 Save Category
                                             </button>
                                         </div>
                                     </form>
                                 </div>
                             </div>
                         )}
 
                         {/* Table */}
                         <div className="overflow-x-auto">
                             <table className="min-w-full border border-gray-300">
                                 <thead className="bg-gray-100">
                                     <tr>
                                         <th className="border px-4 py-2">#</th>
                                         <th className="border px-4 py-2">Name</th>
                                         <th className="border px-4 py-2">description</th>
                                         <th className="border px-4 py-2">Actions</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {categories.length > 0 ? (
                                         categories.map((category, index) => (
                                             <tr key={category.id}>
                                                 <td className="border px-4 py-2">{index + 1}</td>
                                                 <td className="border px-4 py-2">{category.name}</td>
                                                 <td className="border px-4 py-2">{category.description}</td>
                                                 <td className="border px-4 py-2 space-x-2">
                                                     <PrimaryButton
                                                       onClick={() => {
                                                         setEditingCategory(category);
                                                         setShowEditModal(true);
                                                     }}
                                                 >
                                                     Update
                                                     </PrimaryButton>
                                                     <DangerButton onClick={() => handleDelete(category.id)}>
                                                         Delete
                                                     </DangerButton>
                                                 </td>
                                             </tr>
                                         ))
                                     ) : (
                                         <tr>
                                             <td colSpan="4" className="text-center px-4 py-2 border">
                                                 No Category found.
                                             </td>
                                         </tr>
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </div>
                 </div>
             </div>
               {/* Edit Modal */}
             {showEditModal && editingCategory && (
                 <CategoryEdit
                    category={editingCategory}
                    onClose={() => {
                         setEditingCategory(null);
                         setShowEditModal(false);
                     }}
                     onUpdated={() => router.reload()}
                 />
             )}
         </AuthenticatedLayout>
     );
 }
 
