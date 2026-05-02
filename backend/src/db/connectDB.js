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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
    if (!DB_USERNAME || !DB_PASSWORD || !DB_HOST || !DB_NAME) {
        throw new Error('Missing DB credentials');
    }
    const uri = `mongodb+srv://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
    try {
        const conn = yield mongoose_1.default.connect(uri);
        console.log(`MongDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        }
        else {
            console.error('Unknown error:', error);
        }
        process.exit(1);
    }
});
exports.connectDB = connectDB;
