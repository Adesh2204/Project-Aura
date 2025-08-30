import React, { useState } from 'react';
import { Plus, Trash2, User, Phone } from 'lucide-react';
import { EmergencyContact } from '../types';

interface ContactManagerProps {
  contacts: EmergencyContact[];
  onContactsUpdate: (contacts: EmergencyContact[]) => void;
  maxContacts?: number;
}

export const ContactManager: React.FC<ContactManagerProps> = ({
  contacts,
  onContactsUpdate,
  maxContacts = 3
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phoneNumber: '' });

  const handleAddContact = () => {
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      alert('Please fill in both name and phone number');
      return;
    }

    const newContact: EmergencyContact = {
      id: `contact_${Date.now()}`,
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim()
    };

    onContactsUpdate([...contacts, newContact]);
    setFormData({ name: '', phoneNumber: '' });
    setShowAddForm(false);
  };

  const handleRemoveContact = (contactId: string) => {
    onContactsUpdate(contacts.filter(contact => contact.id !== contactId));
  };

  const canAddMore = contacts.length < maxContacts;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
        <span className="text-sm text-gray-500">
          {contacts.length}/{maxContacts}
        </span>
      </div>

      {/* Existing contacts */}
      <div className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{contact.name}</h4>
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {contact.phoneNumber}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveContact(contact.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add contact form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 mt-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contact name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aura-primary focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aura-primary focus:border-transparent text-gray-900"
            />
          </div>
          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleAddContact}
              className="flex-1 bg-aura-primary text-white py-2 px-4 rounded-md hover:bg-aura-primary-dark transition-colors"
            >
              Save Contact
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {canAddMore && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 px-4 text-gray-600 hover:border-aura-primary hover:text-aura-primary transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Emergency Contact</span>
        </button>
      )}

      {contacts.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No emergency contacts added yet</p>
          <p className="text-sm">Add at least one contact to activate Aura</p>
        </div>
      )}
    </div>
  );
};