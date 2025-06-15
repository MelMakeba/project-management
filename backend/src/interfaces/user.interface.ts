/* eslint-disable prettier/prettier */
import { Project, Role } from "generated/prisma";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password:string;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
}
