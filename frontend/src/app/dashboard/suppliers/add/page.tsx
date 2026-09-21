"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Building, Mail, Phone, User } from "lucide-react";
import { useMutation } from '@apollo/client/react';
import { CREATE_SUPPLIER, GET_SUPPLIERS } from '@/graphql/operations';
import { useRouter } from 'next/navigation';

export default function AddSupplierPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [createSupplier] = useMutation(CREATE_SUPPLIER, {
    refetchQueries: [{ query: GET_SUPPLIERS }]
  });
  
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await createSupplier({
        variables: {
          input: {
            name,
            contactName: contactName || undefined,
            email: email || undefined,
            phone: phone || undefined,
          }
        }
      });
      router.push('/dashboard/suppliers');
    } catch (err) {
      console.error(err);
      alert("Failed to save supplier.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard/suppliers" 
          className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Add New Supplier</h1>
          <p className="text-zinc-500 text-sm mt-1">Register a new vendor or manufacturer.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center">
              <Building className="w-4 h-4 mr-2 text-zinc-400" />
              Company Name *
            </label>
            <input required value={name} onChange={e => setName(e.target.value)} type="text" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Acme Corp" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center">
                <User className="w-4 h-4 mr-2 text-zinc-400" />
                Primary Contact Name
              </label>
              <input value={contactName} onChange={e => setContactName(e.target.value)} type="text" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-zinc-400" />
                Email Address
              </label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="jane@acmecorp.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-zinc-400" />
                Phone Number
              </label>
              <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 border-t border-zinc-200 p-4 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center shadow-sm disabled:opacity-70"
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Supplier</>}
          </button>
        </div>
      </form>
    </div>
  );
}
