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
const mongoose_1 = __importDefault(require("mongoose"));
const testHelpers_1 = require("../../src/lib/testHelpers");
const tree_controller_1 = require("../../src/controllers/tree.controller");
const treeNode_model_1 = require("../../src/models/treeNode.model");
jest.mock('../../src/models/treeNode.model');
const mockUserId = new mongoose_1.default.Types.ObjectId();
const buildReq = (overrides = {}) => (Object.assign({ user: Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: mockUserId }) }, overrides));
const flushPromises = () => new Promise(process.nextTick);
// Helper to create a mock tree node
const makeMockNode = (overrides = {}) => (Object.assign({ _id: new mongoose_1.default.Types.ObjectId(), userId: mockUserId, parentId: null, isDeleted: false, isArchived: false, type: 'folder', toObject: jest.fn().mockReturnThis() }, overrides));
describe('Tree Controller', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        jest.clearAllMocks();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        req = buildReq();
    });
    describe('authorization', () => {
        test('throws when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ user: undefined });
            yield (0, tree_controller_1.buildTree)(req, res, next);
            yield flushPromises();
            expect(next.mock.calls[0][0].message).toBe('Unauthorized');
        }));
    });
    describe('tree building', () => {
        test('queries only non-deleted non-archived nodes for the user', () => __awaiter(void 0, void 0, void 0, function* () {
            treeNode_model_1.TreeNode.find.mockResolvedValue([]);
            yield (0, tree_controller_1.buildTree)(req, res, next);
            yield flushPromises();
            expect(treeNode_model_1.TreeNode.find).toHaveBeenCalledWith({
                userId: mockUserId,
                isDeleted: false,
                isArchived: false,
            });
        }));
        test('returns empty tree when user has no nodes', () => __awaiter(void 0, void 0, void 0, function* () {
            treeNode_model_1.TreeNode.find.mockResolvedValue([]);
            yield (0, tree_controller_1.buildTree)(req, res, next);
            yield flushPromises();
            const body = res.json.mock.calls[0][0];
            expect(body.tree).toEqual([]);
        }));
        test('returns root nodes at top level', () => __awaiter(void 0, void 0, void 0, function* () {
            const rootNode = makeMockNode({ parentId: null });
            treeNode_model_1.TreeNode.find.mockResolvedValue([rootNode]);
            yield (0, tree_controller_1.buildTree)(req, res, next);
            yield flushPromises();
            const body = res.json.mock.calls[0][0];
            expect(body.tree).toHaveLength(1);
        }));
        test('nests child nodes under their parent', () => __awaiter(void 0, void 0, void 0, function* () {
            const parent = makeMockNode({ parentId: null });
            const child = makeMockNode({ parentId: parent._id });
            // toObject needs to return a plain object
            parent.toObject = jest.fn().mockReturnValue(Object.assign(Object.assign({}, parent), { children: [] }));
            child.toObject = jest.fn().mockReturnValue(Object.assign(Object.assign({}, child), { children: [] }));
            treeNode_model_1.TreeNode.find.mockResolvedValue([parent, child]);
            yield (0, tree_controller_1.buildTree)(req, res, next);
            yield flushPromises();
            const body = res.json.mock.calls[0][0];
            expect(body.tree).toHaveLength(1); // only root at top level
            expect(body.tree[0].children).toHaveLength(1); // child nested under parent
        }));
        test('skips children whose parent was deleted', () => __awaiter(void 0, void 0, void 0, function* () {
            const orphanChild = makeMockNode({
                parentId: new mongoose_1.default.Types.ObjectId(), // parent not in results
            });
            orphanChild.toObject = jest.fn().mockReturnValue(Object.assign(Object.assign({}, orphanChild), { children: [] }));
            treeNode_model_1.TreeNode.find.mockResolvedValue([orphanChild]);
            yield (0, tree_controller_1.buildTree)(req, res, next);
            yield flushPromises();
            const body = res.json.mock.calls[0][0];
            expect(body.tree).toHaveLength(0); // orphan skipped
        }));
    });
    describe('on success', () => {
        test('returns 200 with success true', () => __awaiter(void 0, void 0, void 0, function* () {
            treeNode_model_1.TreeNode.find.mockResolvedValue([]);
            yield (0, tree_controller_1.buildTree)(req, res, next);
            yield flushPromises();
            expect(res.status).toHaveBeenCalledWith(200);
            const body = res.json.mock.calls[0][0];
            expect(body.success).toBe(true);
        }));
    });
});
