import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Genealogy() {
    const { tree } = usePage().props;

    const renderNode = (node) => (
        <div key={node.id} className="flex flex-col items-center relative m-4">
            {/* Node Card */}
            <div className="p-3 border rounded-lg bg-white shadow hover:shadow-lg text-center min-w-[140px]">
                <p className="font-bold">{node.name}</p>
                <p className="text-sm text-gray-600">{node.email}</p>
            </div>

            {/* Children */}
            {node.children && node.children.length > 0 && (
                <>
                    {/* Vertical line connecting parent to children */}
                    <div className="w-px h-4 bg-gray-400 mt-1"></div>

                    <div className="flex space-x-6 mt-2">
                        {node.children.map((child) => renderNode(child))}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Genealogy Tree</h2>}
        >
            <Head title="Genealogy Tree" />

            <div className="p-6 overflow-auto">
                <h2 className="text-2xl font-bold text-center mb-6">
                    👥 Member Genealogy
                </h2>

                <div className="flex justify-center">
                    <div className="flex">
                        {renderNode(tree)}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
