"use client";
import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utils/api";
import { 
  Search, 
  Plus, 
  Star, 
  StarOff, 
  Edit3, 
  Trash2, 
  X, 
  Filter,
  SortAsc,
  SortDesc,
  UserPlus,
  Heart,
  Clock,
  DollarSign,
  Hash
} from "lucide-react";

interface Contact {
  _id: string;
  contactUserId: string;
  contactWalletId: string;
  contactDisplayName: string;
  contactUsername: string;
  contactEmail: string;
  contactProfileImage?: string;
  isVerified: boolean;
  isFavorite: boolean;
  lastTransferred?: string;
  totalTransferred: number;
  transferCount: number;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContactManagerProps {
  onSelectContact: (contact: Contact) => void;
  onClose: () => void;
}

export default function ContactManager({ onSelectContact, onClose }: ContactManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'lastTransferred' | 'totalTransferred' | 'transferCount'>('lastTransferred');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoading(true);
        const response = await apiGet(`/api/v1/wallets/contacts?sortBy=${sortBy}`) as { data?: Contact[] };
        setContacts(response.data || []);
        setFilteredContacts(response.data || []);
      } catch (error) {
        console.error("Error loading contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, [sortBy]);

  // Filter contacts
  useEffect(() => {
    let filtered = contacts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(contact => 
        contact.contactDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.contactUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.contactWalletId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(contact => contact.isFavorite);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, showFavoritesOnly]);

  // Toggle favorite
  const toggleFavorite = async (contactId: string, isFavorite: boolean) => {
    try {
      await apiPut(`/api/v1/wallets/contacts/${contactId}`, { isFavorite: !isFavorite });
      setContacts(prev => prev.map(contact => 
        contact._id === contactId ? { ...contact, isFavorite: !isFavorite } : contact
      ));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Delete contact
  const deleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      await apiDelete(`/api/v1/wallets/contacts/${contactId}`);
      setContacts(prev => prev.filter(contact => contact._id !== contactId));
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Update contact
  const updateContact = async () => {
    if (!editingContact) return;
    
    try {
      await apiPut(`/api/v1/wallets/contacts/${editingContact._id}`, {
        notes: editNotes,
        tags: editTags
      });
      
      setContacts(prev => prev.map(contact => 
        contact._id === editingContact._id 
          ? { ...contact, notes: editNotes, tags: editTags }
          : contact
      ));
      
      setEditingContact(null);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setEditTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-4 sm:p-6 shadow-xl">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64 mb-4 sm:mb-6"></div>
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
              My Contacts
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4 flex-shrink-0">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                showFavoritesOnly
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              title={showFavoritesOnly ? "Show all contacts" : "Show favorites only"}
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="lastTransferred">Last Transferred</option>
              <option value="name">Name</option>
              <option value="totalTransferred">Total Transferred</option>
              <option value="transferCount">Transfer Count</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-3 h-3 sm:w-4 sm:h-4" /> : <SortDesc className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm sm:text-base">No contacts found</p>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                {searchQuery ? 'Try adjusting your search' : 'Add contacts to make transfers easier'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                        {contact.contactDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-base">
                            {contact.contactDisplayName}
                          </h4>
                          {contact.isVerified && (
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{contact.contactUsername}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {contact.contactWalletId}
                        </p>
                      </div>
                    </div>
                    
                    {contact.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                        {contact.notes}
                      </p>
                    )}
                    
                    {contact.tags.length > 0 && (
                      <div className="flex gap-1 mb-3">
                        {contact.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>₦{(contact.totalTransferred / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span>{contact.transferCount}</span>
                        </div>
                        {contact.lastTransferred && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">{new Date(contact.lastTransferred).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(contact._id, contact.isFavorite)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title={contact.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          {contact.isFavorite ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingContact(contact);
                            setEditNotes(contact.notes || "");
                            setEditTags(contact.tags || []);
                          }}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title="Edit contact"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => onSelectContact(contact)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center gap-4 p-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                    {contact.contactDisplayName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-base">
                        {contact.contactDisplayName}
                      </h4>
                      {contact.isVerified && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{contact.contactUsername} • {contact.contactWalletId}
                    </p>
                    {contact.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                        {contact.notes}
                      </p>
                    )}
                    {contact.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {contact.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{formatCurrency(contact.totalTransferred)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      <span>{contact.transferCount}</span>
                    </div>
                    {contact.lastTransferred && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatDate(contact.lastTransferred)}</span>
                      </div>
                    )}
                  </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleFavorite(contact._id, contact.isFavorite)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title={contact.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {contact.isFavorite ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingContact(contact);
                        setEditNotes(contact.notes || "");
                        setEditTags(contact.tags || []);
                      }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Edit contact"
                    >
                      <Edit3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => onSelectContact(contact)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Contact Modal */}
        {editingContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-60">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Contact
                </h4>
                <button
                  onClick={() => setEditingContact(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes about this contact..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs sm:text-sm rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-6">
                <button
                  onClick={updateContact}
                  className="flex-1 bg-blue-600 text-white py-2.5 sm:py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
