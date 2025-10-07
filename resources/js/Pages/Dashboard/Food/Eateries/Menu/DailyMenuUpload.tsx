import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useRef } from 'react';

// Icons (keep your existing icons)
const GripVertical = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Helper to get CSRF token
function getCsrfToken() {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

// Image Preview Modal Component
function ImagePreviewModal({ imageUrl, isOpen, onClose }: { imageUrl: string; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl"
        >
          <XIcon />
        </button>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

// Add Dish Modal Component
function AddDishModal({
  isOpen,
  onClose,
  onAddDish,
  sections
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddDish: (dish: { name: string; price: string; section: string }) => void;
  sections: string[];
}) {
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [selectedSection, setSelectedSection] = useState(sections[0] || 'Main');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dishName.trim()) {
      onAddDish({
        name: dishName.trim(),
        price: dishPrice.trim(),
        section: selectedSection
      });
      setDishName('');
      setDishPrice('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Dish</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter dish name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price
            </label>
            <input
              type="text"
              value={dishPrice}
              onChange={(e) => setDishPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., $12.99, ₦1500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Dish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// UPDATED: Extras Modal Component with skip functionality
function ExtrasModal({
  isOpen,
  onClose,
  onSaveExtras,
  existingExtras = []
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveExtras: (extras: Array<{ name: string; price: string }> | null) => void;
  existingExtras?: Array<{ name: string; price: string }>;
}) {
  const [extras, setExtras] = useState<Array<{ name: string; price: string }>>(
    existingExtras.length > 0 ? existingExtras : [{ name: '', price: '' }]
  );

  const addExtra = () => {
    setExtras([...extras, { name: '', price: '' }]);
  };

  const removeExtra = (index: number) => {
    if (extras.length > 1) {
      setExtras(extras.filter((_, i) => i !== index));
    }
  };

  const updateExtra = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...extras];
    updated[index][field] = value;
    setExtras(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty extras
    const validExtras = extras.filter(extra => extra.name.trim() !== '');
    onSaveExtras(validExtras.length > 0 ? validExtras : null);
    onClose();
  };

  const handleSkip = () => {
    // Pass null to indicate no extras
    onSaveExtras(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Extra Items & Add-ons (Optional)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Optional:</strong> Add extra items like additional cheese, extra chicken, sauces,
              sides, or any add-ons that customers can purchase with their meals.
              You can skip this if you don't have any extras.
            </p>
          </div>

          <div className="space-y-3">
            {extras.map((extra, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={extra.name}
                      onChange={(e) => updateExtra(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      placeholder="e.g., Extra Cheese, Additional Chicken"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price
                    </label>
                    <input
                      type="text"
                      value={extra.price}
                      onChange={(e) => updateExtra(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      placeholder="e.g., $2.00, ₦500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExtra(index)}
                  disabled={extras.length === 1}
                  className={`p-2 rounded mt-6 ${
                    extras.length === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900'
                  }`}
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addExtra}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            <PlusIcon />
            Add Another Extra
          </button>

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Skip Extras
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Save Extras & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DailyMenuUpload({ eatery, menuDate }: PageProps & { eatery: any; menuDate: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [structuredMenu, setStructuredMenu] = useState<any>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showAddDishModal, setShowAddDishModal] = useState(false);
    const [showExtrasModal, setShowExtrasModal] = useState(false);
    const [extras, setExtras] = useState<Array<{ name: string; price: string }> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag & Drop states
    const [draggedItem, setDraggedItem] = useState<any>(null);
    const [draggedFromSection, setDraggedFromSection] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<{section: string, id: string} | null>(null);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [newSectionName, setNewSectionName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setError(null);

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const previewUrl = URL.createObjectURL(selectedFile);
                setFilePreview(previewUrl);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleExtract = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('eatery_id', eatery.id.toString());
        formData.append('menu_date', menuDate);

        setIsExtracting(true);
        setError(null);

        try {
            const response = await fetch('/daily-menu/extract', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (response.ok) {
                setExtractedText(result.extracted_text || '');

                // Add unique IDs to each item for drag & drop
                const menuWithIds = Object.keys(result.structured_menu || {}).reduce((acc, section) => {
                    acc[section] = result.structured_menu[section].map((item: any, index: number) => ({
                        ...item,
                        id: `${section}-${index}-${Date.now()}`
                    }));
                    return acc;
                }, {} as any);

                setStructuredMenu(menuWithIds);
                console.log('✅ Structured Menu:', menuWithIds);
            } else {
                const errorMsg = result.message || 'Extraction failed. Please try again.';
                setError(errorMsg);
                console.error('❌ Extraction API Error:', errorMsg, result.errors || '');
            }
        } catch (err: any) {
            const networkError = 'Network error. Please check your connection.';
            setError(networkError);
            console.error('🌐 Network Error in handleExtract:', err);
        } finally {
            setIsExtracting(false);
        }
    };

    // Add new dish manually
    const handleAddDish = (dish: { name: string; price: string; section: string }) => {
        const newDish = {
            ...dish,
            id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        setStructuredMenu((prev: any) => {
            const updatedMenu = { ...prev };

            // Ensure the section exists
            if (!updatedMenu[dish.section]) {
                updatedMenu[dish.section] = [];
            }

            // Add the new dish to the section
            updatedMenu[dish.section].push(newDish);

            return updatedMenu;
        });
    };

    // Drag & Drop handlers
    const handleDragStart = (e: React.DragEvent, item: any, sectionName: string) => {
        setDraggedItem(item);
        setDraggedFromSection(sectionName);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnSection = (e: React.DragEvent, targetSection: string) => {
        e.preventDefault();
        if (!draggedItem || !draggedFromSection) return;

        const updatedMenu = { ...structuredMenu };

        // Remove from old section
        updatedMenu[draggedFromSection] = updatedMenu[draggedFromSection].filter(
            (item: any) => item.id !== draggedItem.id
        );

        // Add to new section
        if (!updatedMenu[targetSection]) {
            updatedMenu[targetSection] = [];
        }
        updatedMenu[targetSection].push(draggedItem);

        setStructuredMenu(updatedMenu);
        setDraggedItem(null);
        setDraggedFromSection(null);
    };

    // Edit handlers
    const startEditItem = (sectionName: string, itemId: string) => {
        setEditingItem({ section: sectionName, id: itemId });
    };

    const saveItemEdit = (sectionName: string, itemId: string, field: string, value: string) => {
        setStructuredMenu((prev: any) => ({
            ...prev,
            [sectionName]: prev[sectionName].map((item: any) =>
                item.id === itemId ? { ...item, [field]: value } : item
            )
        }));
    };

    const startEditSection = (oldName: string) => {
        setEditingSection(oldName);
        setNewSectionName(oldName);
    };

    const saveSection = (oldName: string) => {
        if (newSectionName && newSectionName !== oldName) {
            const items = structuredMenu[oldName];
            const newMenu = { ...structuredMenu };
            delete newMenu[oldName];
            newMenu[newSectionName] = items;
            setStructuredMenu(newMenu);
        }
        setEditingSection(null);
    };

    const deleteItem = (sectionName: string, itemId: string) => {
        setStructuredMenu((prev: any) => ({
            ...prev,
            [sectionName]: prev[sectionName].filter((item: any) => item.id !== itemId)
        }));
    };

    const deleteSection = (sectionName: string) => {
        if (confirm(`Delete entire "${sectionName}" section?`)) {
            const newMenu = { ...structuredMenu };
            delete newMenu[sectionName];
            setStructuredMenu(newMenu);
        }
    };

    const addNewSection = () => {
        const sectionName = prompt('Enter new section name:');
        if (sectionName && structuredMenu && !structuredMenu[sectionName]) {
            setStructuredMenu((prev: any) => ({ ...prev, [sectionName]: [] }));
        }
    };

    // UPDATED: Handle saving extras (can be null)
    const handleSaveExtras = (newExtras: Array<{ name: string; price: string }> | null) => {
        setExtras(newExtras);
        // Now proceed with final save to database
        saveToDatabase(newExtras);
    };

    // UPDATED: Handle final submission
    const handleSubmit = () => {
        if (!structuredMenu) {
            setError('Please extract the menu first.');
            return;
        }

        // Show extras modal instead of directly saving
        setShowExtrasModal(true);
    };

    // UPDATED: Final save to database with nullable extras
    const saveToDatabase = (finalExtras: Array<{ name: string; price: string }> | null = null) => {
        // Remove IDs before submitting
        const cleanedMenu = Object.keys(structuredMenu).reduce((acc, section) => {
            acc[section] = structuredMenu[section].map(({ id, ...item }: any) => item);
            return acc;
        }, {} as any);

        // Prepare data for database - extras can be null
        const menuData = {
            eatery_id: eatery.id,
            menu_date: menuDate,
            source_type: file?.type.startsWith('image/') ? 'image' : 'pdf',
            source_file: file,
            extracted_text: extractedText,
            structured_menu: cleanedMenu,
            extras: finalExtras, // This can be null or array
        };

        console.log('📦 Saving to database:', {
            menuSections: Object.keys(cleanedMenu),
            totalItems: Object.values(cleanedMenu).flat().length,
            extrasCount: finalExtras ? finalExtras.length : 0,
            extras: finalExtras
        });

        router.post(route('daily-menu.store'), menuData, {
            preserveState: true,
            onSuccess: () => {
                alert('Menu saved successfully!');
                window.location.href = route('dashboard');
            },
            onError: (errors) => {
                setError(Object.values(errors).join(', '));
                console.error('❌ Save errors:', errors);
            },
        });
    };

    // Get available sections for the add dish modal
    const availableSections = structuredMenu ? Object.keys(structuredMenu) : ['Main', 'Appetizers', 'Desserts', 'Drinks'];

    return (
        <>
            <Head title={`Upload Daily Menu for ${eatery.name} - ${menuDate}`} />

            {/* Image Preview Modal */}
            <ImagePreviewModal
                imageUrl={previewImage || ''}
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
            />

            {/* Add Dish Modal */}
            <AddDishModal
                isOpen={showAddDishModal}
                onClose={() => setShowAddDishModal(false)}
                onAddDish={handleAddDish}
                sections={availableSections}
            />

            {/* UPDATED: Extras Modal */}
            <ExtrasModal
                isOpen={showExtrasModal}
                onClose={() => setShowExtrasModal(false)}
                onSaveExtras={handleSaveExtras}
                existingExtras={extras || []}
            />

            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Upload Menu for {eatery.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Date: {menuDate}</p>

                {/* File Upload with Preview */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Menu (PDF or Image)
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />

                    {file && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Selected: {file.name}
                                {filePreview && (
                                    <button
                                        onClick={() => setPreviewImage(filePreview)}
                                        className="ml-3 inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                                    >
                                        <EyeIcon />
                                        Preview Image
                                    </button>
                                )}
                            </p>

                            {/* Show uploaded image preview thumbnail */}
                            {filePreview && (
                                <div className="mt-2">
                                    <img
                                        src={filePreview}
                                        alt="Uploaded menu preview"
                                        className="h-32 w-auto rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                        onClick={() => setPreviewImage(filePreview)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Click image to view full size</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Extract Button */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={handleExtract}
                        disabled={!file || isExtracting}
                        className={`px-4 py-2 rounded-md font-medium ${
                            !file || isExtracting
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isExtracting ? 'Extracting...' : 'Extract Menu'}
                    </button>

                    {/* Add Dish Button - Only show after extraction */}
                    {structuredMenu && (
                        <button
                            onClick={() => setShowAddDishModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                        >
                            <PlusIcon />
                            Add Missing Dish
                        </button>
                    )}
                </div>

                {error && <p className="mt-4 text-red-600">{error}</p>}



                {/* Drag & Drop Editable Menu */}
                {structuredMenu && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Edit Parsed Menu
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    ({Object.values(structuredMenu).flat().length} items)
                                </span>
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddDishModal(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                >
                                    <PlusIcon />
                                    Add Dish
                                </button>
                                <button
                                    onClick={addNewSection}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                >
                                    <PlusIcon />
                                    Add Section
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {Object.keys(structuredMenu).map((section) => (
                                <div
                                    key={section}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDropOnSection(e, section)}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                                >
                                    {/* Section Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                                        {editingSection === section ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="text"
                                                    value={newSectionName}
                                                    onChange={(e) => setNewSectionName(e.target.value)}
                                                    className="px-2 py-1 rounded bg-white text-gray-900 flex-1"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveSection(section);
                                                        if (e.key === 'Escape') setEditingSection(null);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => saveSection(section)}
                                                    className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-lg font-bold text-white">
                                                    {section}
                                                    <span className="text-blue-100 text-sm font-normal ml-2">
                                                        ({structuredMenu[section].length} items)
                                                    </span>
                                                </h3>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditSection(section)}
                                                        className="px-2 py-1 hover:bg-blue-800 rounded text-white text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteSection(section)}
                                                        className="p-1 hover:bg-red-600 rounded"
                                                    >
                                                        <XIcon />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Menu Items */}
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {structuredMenu[section].length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 text-sm">
                                                Drop items here or section is empty
                                            </div>
                                        ) : (
                                            structuredMenu[section].map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, item, section)}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-move transition-colors group"
                                                >
                                                    {/* Drag Handle */}
                                                    <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400">
                                                        <GripVertical />
                                                    </div>

                                                    {/* Show uploaded image thumbnail if this is an image file */}
                                                    {filePreview && file?.type.startsWith('image/') && (
                                                        <div
                                                            className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 cursor-pointer"
                                                            onClick={() => setPreviewImage(filePreview)}
                                                        >
                                                            <img
                                                                src={filePreview}
                                                                alt="Uploaded menu"
                                                                className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-300 dark:border-gray-600"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                                                                <EyeIcon />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Manual dish indicator */}
                                                    {item.id.includes('manual-') && (
                                                        <div className="flex-shrink-0">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                Manual
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Editable Name */}
                                                    <div className="flex-1 min-w-0 px-2">
                                                        {editingItem?.section === section && editingItem?.id === item.id ? (
                                                            <input
                                                                type="text"
                                                                defaultValue={item.name}
                                                                onBlur={(e) => {
                                                                    saveItemEdit(section, item.id, 'name', e.target.value);
                                                                    setEditingItem(null);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        saveItemEdit(section, item.id, 'name', (e.target as HTMLInputElement).value);
                                                                        setEditingItem(null);
                                                                    }
                                                                    if (e.key === 'Escape') setEditingItem(null);
                                                                }}
                                                                className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <div
                                                                onClick={() => startEditItem(section, item.id)}
                                                                className="text-sm font-medium text-gray-900 dark:text-white cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"
                                                            >
                                                                {item.name}
                                                                {item.id.includes('manual-') && (
                                                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">(added manually)</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Editable Price */}
                                                    <div className="flex-shrink-0 text-right w-24">
                                                        {editingItem?.section === section && editingItem?.id === item.id ? (
                                                            <input
                                                                type="text"
                                                                defaultValue={item.price}
                                                                onBlur={(e) => {
                                                                    saveItemEdit(section, item.id, 'price', e.target.value);
                                                                    setEditingItem(null);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        saveItemEdit(section, item.id, 'price', (e.target as HTMLInputElement).value);
                                                                        setEditingItem(null);
                                                                    }
                                                                    if (e.key === 'Escape') setEditingItem(null);
                                                                }}
                                                                className="w-full px-2 py-1 border rounded text-sm text-right bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                            />
                                                        ) : (
                                                            <div
                                                                onClick={() => startEditItem(section, item.id)}
                                                                className="text-sm font-bold text-green-600 dark:text-green-400 cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 whitespace-nowrap"
                                                            >
                                                                {item.price || 'No price'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => deleteItem(section, item.id)}
                                                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
                                                    >
                                                        <XIcon />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Button */}
                {structuredMenu && (
                    <div className="mt-8 sticky bottom-4">
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors"
                        >
                            💰 Save Menu {extras ? `(${extras.length} extras)` : ''} ({Object.values(structuredMenu).flat().length} items)
                        </button>
                        {extras && (
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                                ✅ {extras.length} extra item(s) will be included
                            </p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
