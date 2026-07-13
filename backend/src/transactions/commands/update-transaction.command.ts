import { UpdateTransactionDto } from "../dto/update-transaction.dto";

export class UpdateTransactionCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly dto: UpdateTransactionDto,
  ) {}
}
