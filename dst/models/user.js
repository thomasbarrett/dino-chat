"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class User {
}
class UserDatabase {
    constructor(client, name) {
        this.users = client.db(name).collection("users");
    }
    getUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            let cursor = this.users.find({ username })
                .project({ password: 0, admin: 0 });
            return yield cursor.next();
        });
    }
    getFriends(user, page, count) {
        return __awaiter(this, void 0, void 0, function* () {
            let cursor = this.users.find({ username: user.friends })
                .project({ password: 0, admin: 0 })
                .skip(page - 1 * count)
                .limit(count);
            return yield cursor.toArray();
            ``;
        });
    }
    addFriends(username, friends) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.users.updateOne({ username }, { $push: { friends: { $each: friends } } });
            return result.upsertedCount == friends.length;
        });
    }
    queryUsers(query, page, count) {
        return __awaiter(this, void 0, void 0, function* () {
            let cursor = this.users.find({ username: { $regex: query } })
                .project({ password: 0, admin: 0 })
                .skip((page - 1) * count)
                .limit(count);
            return yield cursor.toArray();
        });
    }
}
exports.UserDatabase = UserDatabase;
