import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

function NoNextAppointments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-primary" />
          Prochain rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="size-8 opacity-50" />
          </div>
          <p className="text-sm mb-3">Aucun rendez-vous prévu</p>
          <Link href="/appointments">
            <Button size="sm" variant="outline" className="w-full">
              Planifier votre prochaine visite
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default NoNextAppointments;
