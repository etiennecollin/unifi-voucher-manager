export default function Spinner() {
  return (
    <div className="flex-center py-4">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-3 border-default" />
        <div className="absolute inset-0 rounded-full border-3 border-accent border-t-transparent animate-spin" />
      </div>
    </div>
  );
}
