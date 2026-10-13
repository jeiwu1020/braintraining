// @vitest-environment jsdom
import{beforeEach,expect,it,vi}from'vitest';import{readFacilitatorKnowledge,saveFacilitatorKnowledge}from'../utils/facilitatorKnowledge';
beforeEach(()=>{sessionStorage.clear();vi.restoreAllMocks();});
it('saves only question IDs, merges prior reveals and isolates games',()=>{
 saveFacilitatorKnowledge('hanoi-test',['one']);saveFacilitatorKnowledge('hanoi-test',['two','one']);
 expect(readFacilitatorKnowledge('hanoi-test')).toEqual(['one','two']);expect(readFacilitatorKnowledge('nim-test')).toEqual([]);
});
it('rejects malformed saved payloads without crashing',()=>{
 sessionStorage.setItem('braintraining-knowledge:bad-test','{"patient":"not a question array"}');expect(readFacilitatorKnowledge('bad-test')).toEqual([]);
});
it('retains page-memory knowledge when browser storage is unavailable',()=>{
 vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw Error('disabled');});vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('disabled');});
 saveFacilitatorKnowledge('fallback-test',['known']);expect(readFacilitatorKnowledge('fallback-test')).toEqual(['known']);
});
it('keeps memory reveals when reads succeed but writes fail',()=>{
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('full','QuotaExceededError');});
 saveFacilitatorKnowledge('write-failure-test',['seen']);expect(readFacilitatorKnowledge('write-failure-test')).toContain('seen');
});
