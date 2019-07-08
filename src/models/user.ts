import { MongoClient, Collection, ObjectID } from "mongodb"

class User {
  _id: ObjectID;
  username: string;
  password: string;
  admin: boolean;
  friends: string[];
}

function sanitize(user: User) {
  let {password, ...result} = user;
  return result;
}

function sanitizeUsers(users: User[]) {
  return users.map(user => sanitize(user));
}

class UserDatabase {
  users: Collection<User>;
  constructor(client: MongoClient, name: string) {
    this.users = client.db(name).collection("users")
  }

  async getUser(username: string, sanitized: boolean) {
    let cursor = this.users.find({username})

    return await cursor.next();
  }

  async getFriends(user: User, page: number, count: number): Promise<User[]> {
    let cursor = this.users.find({username: user.friends})
                           .project({password: 0, admin: 0})
                           .skip(page - 1 * count)
                           .limit(count);

    return await cursor.toArray();``
  }

  async addFriends(username: string, friends: string[]): Promise<boolean> {
    let result = await this.users.updateOne({username},
                                            {$push: { friends: {$each: friends}}});

    return result.upsertedCount == friends.length;                                     
  }

  async queryUsers(query: string, page: number, count: number) {
    let cursor = this.users.find({username: {$regex: query}})
                           .project({password: 0, admin: 0})
                           .skip((page - 1) * count)
                           .limit(count);

    return await cursor.toArray();
  }
}

export { UserDatabase, sanitize, sanitizeUsers}