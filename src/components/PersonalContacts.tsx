import React, { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, X, Save, User as UserIcon } from 'lucide-react';
import { db, collection, addDoc, onSnapshot, deleteDoc, doc, query, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { Language, useTranslation } from '../lib/translations';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface PersonalContactsProps {
  user: UserProfile;
  lang: Language;
}

export const PersonalContacts: React.FC<PersonalContactsProps> = ({ user, lang }) => {
  const { t } = useTranslation(lang);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    const path = `users/${user.uid}/personalContacts`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      setContacts(contactsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleAdd = async () => {
    if (!newName || !newPhone) return;
    const path = `users/${user.uid}/personalContacts`;
    try {
      await addDoc(collection(db, path), {
        name: newName,
        phone: newPhone,
        createdAt: new Date().toISOString()
      });
      setNewName('');
      setNewPhone('');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async (id: string) => {
    const path = `users/${user.uid}/personalContacts/${id}`;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/personalContacts`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
          <UserIcon size={16} className="text-blue-500" />
          {t('my_contacts')}
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 rounded-2xl space-y-3">
          <input 
            type="text" 
            placeholder={t('name')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            type="tel" 
            placeholder={t('phone')}
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button 
              onClick={handleAdd}
              className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <Save size={14} /> {t('save')}
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs font-bold"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {contacts.length === 0 && !isAdding && (
          <p className="text-xs text-gray-400 italic text-center py-4">No personal contacts added yet.</p>
        )}
        {contacts.map(contact => (
          <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Phone size={14} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.phone}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(contact.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
