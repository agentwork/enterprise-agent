import { ModelTestForm } from "@/features/admin/components/model-test-form";

export default function ModelTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Model Connection Test</h1>
      <div className="max-w-2xl">
        <ModelTestForm />
      </div>
    </div>
  );
}
