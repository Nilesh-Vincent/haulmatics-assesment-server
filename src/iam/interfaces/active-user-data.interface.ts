import { Role } from "../../users/enums/role.enum";

export interface ActiveUserData {
  sub: number;
  email: String;
  username: string;
  role:Role
}
