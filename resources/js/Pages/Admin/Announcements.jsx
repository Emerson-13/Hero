import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import DeleteButton from "@/Components/DeleteButton";

export default function Announcements({ announcements }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const submitAnnouncement = (e) => {
        e.preventDefault();
        router.post(route("announcements.store"), { title, content }, {
            onSuccess: () => {
                setTitle("");
                setContent("");
            }
        });
    };

    const deleteAnnouncement = (id) => {
        if (confirm("Are you sure you want to delete this announcement?")) {
            router.delete(route("admin.announcements.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout
        >
            <Head title="Announcements" />

            <div className="py-10 min-h-screen bg-slate-100">
                <div className="max-w-6xl mx-auto  space-y-8 px-6">

                    <h2 className="text-5xl font-semibold text-gray-800">Announcements</h2>

                    {/* Form */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold mb-4">Post New Announcement</h3>
                        <form onSubmit={submitAnnouncement} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                            <textarea
                                placeholder="Content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Post Announcement
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {announcements.data.length > 0 ? (
                            announcements.data.map((announcement) => (
                                <div key={announcement.id} className="bg-white p-4 rounded shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-semibold">{announcement.title}</h4>
                                            <p className="text-gray-700 mt-1">{announcement.content}</p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                Posted by Admin #{announcement.user_id} • {new Date(announcement.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <DeleteButton
                                            onClick={() => deleteAnnouncement(announcement.id)}
                                            className="ml-4 text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </DeleteButton>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">No announcements found</p>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-4 space-x-2">
                        {announcements.links.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => link.url && router.get(link.url)}
                                className={`px-3 py-1 border rounded ${link.active ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
