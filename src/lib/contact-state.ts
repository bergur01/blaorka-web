// Sameiginleg staða fyrir samskiptaform – aðskilin frá Server Action
// því "use server"-skrár mega aðeins flytja út async föll.

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  ticketNumber?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message" | "attachments", string>>;
};

export const initialContactState: ContactState = { status: "idle" };
