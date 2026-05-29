import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTeamMembers } from "@/server/data";

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#a28572]">Team</p>
        <h2 className="text-3xl font-semibold text-[#7b3f05]">Users & roles</h2>
      </div>
      <Card className="rounded-[2rem] border-[#eddccf] shadow-none">
        <CardHeader>
          <CardTitle>Team members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{"user" in member ? member.user.name : member.name}</TableCell>
                  <TableCell>{"user" in member ? member.user.email : member.email}</TableCell>
                  <TableCell>{"role" in member ? member.role : "Owner"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {"status" in member ? member.status : "Active"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
