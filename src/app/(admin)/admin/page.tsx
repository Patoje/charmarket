import { getDolarValue } from "@/app/actions/config";
import { DolarForm } from "./DolarForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function AdminPage() {
  const dolarValue = await getDolarValue();

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Configuración General</h1>
        <p className="text-muted-foreground mt-2">Gestiona el valor global de la tienda.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Cambio</CardTitle>
          <CardDescription>
            Gestiona el valor interno del dólar para la conversión dinámica de precios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DolarForm currentValue={dolarValue} />
        </CardContent>
      </Card>
    </div>
  );
}
