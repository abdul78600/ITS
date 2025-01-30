// Update the button click handler in the header
<button
  onClick={() => setShowContactForm(true)}
  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
>
  <Plus className="h-5 w-5" />
  Add Contact
</button>

// Add state for showing form
const [showContactForm, setShowContactForm] = useState(false);

// Add form submission handler
const handleNewContact = (contactData: any) => {
  setContacts([contactData, ...contacts]);
  setShowContactForm(false);
};

// Add the form to the JSX
{showContactForm && (
  <ContactForm
    onClose={() => setShowContactForm(false)}
    onSubmit={handleNewContact}
  />
)}