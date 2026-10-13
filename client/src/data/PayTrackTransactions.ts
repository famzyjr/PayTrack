 
import type { PayTrackTransactions } from "../types/PayTrackTransactions";

export const initialTransactions: PayTrackTransactions[] = [
  {
    id: "1",
    sender: "Ada Okafor",
    initials: "AO",
    reference: "PAY-483920",
    date: "Oct 11, 2026",
    amount: 125000,
    status: "Confirmed",
  },
  {
    id: "2",
    sender: "John Bello",
    initials: "JB",
    reference: "PAY-483944",
    date: "Oct 11, 2026",
    amount: 42000,
    status: "Pending",
  },
  {
    id: "3",
    sender: "Musa Ibrahim",
    initials: "MI",
    reference: "PAY-484011",
    date: "Oct 10, 2026",
    amount: 80000,
    status: "Confirmed",
  },
  {
    id: "4",
    sender: "Grace Eze",
    initials: "GE",
    reference: "PAY-484087",
    date: "Oct 10, 2026",
    amount: 55000,
    status: "Needs review",
  },
  {
    id: "5",
    sender: "Tunde Adebayo",
    initials: "TA",
    reference: "PAY-484120",
    date: "Oct 09, 2026",
    amount: 180000,
    status: "Confirmed",
  },
   {
    id: "6",
    sender: "fnde Adebayo",
    initials: "TA",
    reference: "PAY-484120",
    date: "Oct 09, 2026",
    amount: 1850000,
    status: "Confirmed",
  },
];
