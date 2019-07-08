"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
class User {
}
function sanitize(user) {
    let { password } = user, result = __rest(user, ["password"]);
    return result;
}
exports.sanitize = sanitize;
function sanitizeUsers(users) {
    return users.map(user => sanitize(user));
}
exports.sanitizeUsers = sanitizeUsers;
class UserDatabase {
    constructor(client, name) {
        this.users = client.db(name).collection("users");
    }
    getUser(username, sanitized) {
        return __awaiter(this, void 0, void 0, function* () {
            let cursor = this.users.find({ username });
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
