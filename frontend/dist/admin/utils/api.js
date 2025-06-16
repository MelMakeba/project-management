"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUsers = fetchUsers;
exports.createUser = createUser;
// src/admin/utils/api.ts
const constants_1 = require("./constants");
const auth_1 = require("./auth");
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${constants_1.API_BASE}/users`, {
            headers: (0, auth_1.getAuthHeaders)()
        });
        return response.json();
    });
}
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${constants_1.API_BASE}/users`, {
            method: 'POST',
            headers: (0, auth_1.getAuthHeaders)(),
            body: JSON.stringify(user)
        });
        return response.json();
    });
}
