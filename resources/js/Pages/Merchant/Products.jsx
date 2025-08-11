import { useState, useMemo  } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import ProductEdit from './ProductEdit'
import Select from 'react-select';
import UploadProductModal from '@/Modal/UploadProductModal';


export default function Products() {
    const { products = [],  categories = []} = usePage().props;
    const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
    const [showModal, setShowModal] = useState(false);
        const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        barcode:'',
        price: '',
        stock: '',
        category_id: '',
    });
    console.log('Categories:', categories);
    const [search, setSearch] = useState('');
    
       const filteredProduct = useMemo(() => {
        return products.filter((product) => {
            const Product = product?.name?.toLowerCase() ?? '';
            const Barcode = product?.barcode?.toLowerCase() ?? '';
            const Description = product?.description?.toLowerCase() ?? '';
            const Price = product?.price?.toLowerCase() ?? '';
            const query = search.toLowerCase();
    
            return Product.includes(query) || Description.includes(query) || Barcode.includes(query) || Price.includes(query);
        });
        }, [search, products]);     


    const submit = (e) => {
        e.preventDefault();

        post(route('products.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
                router.reload();
                alert('Product created successfully!');
            },
            onError: () => {
                console.log(errors);
            },
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        router.delete(route('products.destroy', id), {
            onSuccess: () => {
                router.reload();
                alert('Product deleted successfully.')
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Products</h2>}
        >
            <Head title="Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                         <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">📦 Product List</h2>
                            <p className="text-center text-gray-600 mb-6">
                                Manage and organize product categories in your system.
                            </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Insert Product Panel */}
                                   <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-3">📥 Insert Product</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Add a new product with details such as category, stock, and price.
                                            </p>
                                        </div>
                                         <PrimaryButton
                                            onClick={() => setShowUploadModal(true)}
                                            className="bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Upload Products
                                        </PrimaryButton>
                                        <PrimaryButton
                                            onClick={() => setShowModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700 self-start"
                                        >
                                            + Add Product
                                        </PrimaryButton>
                                    </div>
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">📤 Export Product Data</h3>

                                        {/* Multi-Select Categories */}
                                        <div className="mb-4">
                                             <p className="text-sm text-gray-500 mb-4">
                                                    Select one or more categories below to export products as an Excel file.
                                                </p>
                                            <Select
                                        isMulti
                                        options={categoryOptions}
                                        value={categoryOptions.filter(option => selectedCategories.includes(option.value))}
                                        onChange={(selected) => setSelectedCategories(selected.map(opt => opt.value))}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                        </div>
                                        <a
                                        href={route('export.products.csv', {
                                            category_id: selectedCategories.length > 0 ? selectedCategories : undefined,
                                        })}
                                        className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                                    >
                                        Export Products
                                    </a>
                                    </div>
                                </div>
                              {/* Search Panel */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Search Products</h3>
                                <input
                                    type="text"
                                    placeholder="Customer name, invoice #, or date"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                />
                            </div>
                            {/* Modal */}
                            {showModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
                                        <h2 className="text-lg font-semibold mb-4">Add Product</h2>
                                        <form onSubmit={submit} className="space-y-4">
                                            <div className="mt-4">
                                                <InputLabel htmlFor="name" value="Name" />
                                                    <TextInput
                                                        id="name"
                                                        name="name"
                                                        value={data.name}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        required
                                                    />
                                                <InputError message={errors.name} className="mt-2" />
                                            </div>
                                             <div className="mt-4">
                                                <InputLabel htmlFor="barcode" value="Barcode" />
                                                    <TextInput
                                                        id="barcode"
                                                        type="text"
                                                        name="barcode"
                                                        value={data.barcode}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => setData('barcode', e.target.value)}
                                                        required
                                                    />
                                                <InputError message={errors.description} className="mt-2" />
                                            </div>
                                            
                                            <div className="mt-4">
                                                <InputLabel htmlFor="description" value="Description" />
                                                    <TextInput
                                                        id="description"
                                                        type="text"
                                                        name="description"
                                                        value={data.description}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => setData('description', e.target.value)}
                                                        required
                                                    />
                                                <InputError message={errors.description} className="mt-2" />
                                            </div>
                                            
                                            <div className="mt-4">
                                                <InputLabel htmlFor="stock" value="Stock" />
                                                    <TextInput
                                                        id="stock"
                                                        type="number"
                                                        name="stock"
                                                        value={data.stock}
                                                        className="mt-1 block w-full"
                                                        autoComplete="stock"
                                                        onChange={(e) => setData('stock', e.target.value)}
                                                    />
                                                <InputError message={errors.stock} className="mt-2" />
                                            </div>
                                            
                                            <div className="mt-4">
                                                <InputLabel htmlFor="price" value="Price" />
                                                    <TextInput
                                                        id="price"
                                                        type="number"
                                                        name="price"
                                                        value={data.price}
                                                        className="mt-1 block w-full"
                                                        autoComplete="price"
                                                        onChange={(e) => setData('price', e.target.value)}
                                                    />
                                                <InputError message={errors.price} className="mt-2" />
                                            </div>

                                            <div className="mt-4">
                                                <InputLabel htmlFor="category_id" value="Category" />
                                                <select
                                                    id="category_id"
                                                    name="category_id"
                                                    value={data.category_id}
                                                    onChange={(e) => setData('category_id', e.target.value)}
                                                    className="mt-1 block w-full border rounded p-2"
                                                    required
                                                >
                                                    <option value="">-- Select Category --</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.category_id} className="mt-2" />
                                            </div>

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
                                                    Save Product
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
                                            <th className="border px-4 py-2">Category Name</th>
                                            <th className="border px-4 py-2">Name</th>
                                            <th className="border px-4 py-2">Barcode</th>
                                            <th className="border px-4 py-2">description</th>
                                            <th className="border px-4 py-2">Price</th>
                                            <th className="border px-4 py-2">stock</th>
                                            <th className="border px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProduct.length > 0 ? (
                                           [...filteredProduct]
                                            .map((product, index) => (
                                                <tr key={product.id}>
                                                    <td className="border px-4 py-2">{index + 1}</td>
                                                    <td className="border px-4 py-2">{product.category?.name || 'Uncategorized'}</td>
                                                    <td className="border px-4 py-2">{product.name}</td>
                                                    <td className="border px-4 py-2">{product.barcode}</td>
                                                    <td className="border px-4 py-2">{product.description}</td>
                                                    <td className="border px-4 py-2">₱{Number(product.price).toFixed(2)}</td>
                                                    <td className="border px-4 py-2">{Number(product.stock).toFixed(2)}</td>
                                                    <td className="border px-4 py-2 space-x-2">
                                                        <PrimaryButton
                                                            //onClick={() =>
                                                                //router.visit(route('products.edit', product.id))
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            setShowEditModal(true);
                                                        }}
                                                    >
                                                        Update
                                                        </PrimaryButton>
                                                        <DangerButton onClick={() => handleDelete(product.id)}>
                                                            Delete
                                                        </DangerButton>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center px-4 py-2 border">
                                                    No products found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                     <UploadProductModal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
            />
                </div>
                {/* Edit Modal */}
                {showEditModal && editingProduct && (
                    <ProductEdit
                        product={editingProduct}
                        categories={categories}
                        onClose={() => {
                            setEditingProduct(null);
                            setShowEditModal(false);
                    }}
                    onUpdated={() => router.reload()}
                />
                
                
            )}
        </AuthenticatedLayout>
    );
}
