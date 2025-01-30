// Update the button click handler in the header
<button
  onClick={() => setShowContractForm(true)}
  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
>
  <Plus className="h-5 w-5" />
  New Contract
</button>

// Add state for showing form
const [showContractForm, setShowContractForm] = useState(false);

// Add form submission handler
const handleNewContract = (contractData: any) => {
  setContracts([contractData, ...contracts]);
  setShowContractForm(false);
};

// Add the form to the JSX
{showContractForm && (
  <ContractForm
    onClose={() => setShowContractForm(false)}
    onSubmit={handleNewContract}
  />
)}