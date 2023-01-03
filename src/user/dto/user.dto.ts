export class CreateCustomerUserDTO {
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class CreateEventOrganizerUserDTO {
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  organizationName: string;
}

export class LoginDTO {
  phoneNumber: string;
  password: string;
}

export class SuccessfulLoginDTO {
  status: number;
  message: string;
  jwt: string;
}

export class SuccessfulRegisterDTO {
  status: number;
  message: string;
  jwt: string;
}
