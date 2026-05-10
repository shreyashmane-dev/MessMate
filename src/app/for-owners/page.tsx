import { InfoPageLayout } from "@/components/shared/InfoPageLayout";

export default function ForOwnersPage() {
  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6">Grow Your Mess Business</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Digitize your operations, manage your menu, and connect with thousands of hungry students.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-3xl bg-red-50 border border-red-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Digital Presence</h3>
            <p className="text-slate-600">Get a professional listing with photos, location, and verified reviews.</p>
          </div>
          <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Menu Management</h3>
            <p className="text-slate-600">Update your daily and weekly menus instantly for all students to see.</p>
          </div>
          <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Direct Connection</h3>
            <p className="text-slate-600">Receive join requests and queries directly from interested students.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
