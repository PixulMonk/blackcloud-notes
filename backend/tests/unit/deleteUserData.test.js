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
const deleteUserData_1 = __importDefault(require("../../src/utils/deleteUserData"));
const treeNode_model_1 = require("../../src/models/treeNode.model");
const note_model_1 = require("../../src/models/note.model");
jest.mock('../../src/models/treeNode.model');
jest.mock('../../src/models/note.model');
describe('Delete User Data Utility Function Unit Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('no data found', () => {
        test('completes without error when no data exists', () => __awaiter(void 0, void 0, void 0, function* () {
            note_model_1.Note.deleteMany.mockResolvedValue({ deletedCount: 0 });
            treeNode_model_1.TreeNode.deleteMany.mockResolvedValue({ deletedCount: 0 });
            yield expect((0, deleteUserData_1.default)('test-user-id')).resolves.not.toThrow();
        }));
    });
    describe('database updates', () => {
        test('user data is deleted when found', () => __awaiter(void 0, void 0, void 0, function* () {
            note_model_1.Note.deleteMany.mockResolvedValue({ deletedCount: 3 });
            treeNode_model_1.TreeNode.deleteMany.mockResolvedValue({ deletedCount: 3 });
            yield (0, deleteUserData_1.default)('test-user-id');
            expect(note_model_1.Note.deleteMany).toHaveBeenCalledTimes(1);
            expect(treeNode_model_1.TreeNode.deleteMany).toHaveBeenCalledTimes(1);
            expect(note_model_1.Note.deleteMany).toHaveBeenCalledWith({
                userId: 'test-user-id',
            });
            expect(treeNode_model_1.TreeNode.deleteMany).toHaveBeenCalledWith({
                userId: 'test-user-id',
            });
        }));
    });
});
