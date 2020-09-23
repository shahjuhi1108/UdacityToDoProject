import { TodoAccess } from '../datalayer/todoAccess'


const todoAccess = new TodoAccess()

export async function getTodosPerUser(userId: string): Promise<any> {
    return todoAccess.getTodosPerUser(userId)
}