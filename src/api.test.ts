import { api } from "./api";
import { setVerbose, debug } from "@nephelaiio/logger"

import { describe, expect, test, vi, beforeAll } from "vitest";

const CLOUDFLARE_API_TOKEN = 'token';
const CLOUDFLARE_ACCOUNT_ID = 'id';

setVerbose();
const domains = [
  {
    id: '00000000000000000000000000000001',
    name: 'domain1.nephelai.io',
  },
  {
    id: '00000000000000000000000000000002',
    name: 'domain2.nephelai.io',
  },
  {
    id: '00000000000000000000000000000003',
    name: 'domain3.nephelai.io',
  }
]

beforeAll(() => {
  global.fetch = vi.fn()
    .mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => ({
          result: [{ id: CLOUDFLARE_ACCOUNT_ID }],
          result_info: {
            page: 1,
            per_page: 20,
            total_pages: 1,
            count: 1,
            total_count: 1
          },
          success: true,
          errors: [],
          messages: []
        })
      })
    )
    .mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => ({
          result: [domains[0]],
          result_info: { page: 1, per_page: 1, total_pages: 3, count: 1, total_count: 3 },
          success: true,
          errors: [],
          messages: []
        })
      })
    )
    .mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => ({
          result: [domains[1]],
          result_info: { page: 2, per_page: 1, total_pages: 3, count: 1, total_count: 3 },
          success: true,
          errors: [],
          messages: []
        })
      })
    )
    .mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => ({
          result: [domains[2]],
          result_info: { page: 1, per_page: 1, total_pages: 3, count: 1, total_count: 3 },
          success: true,
          errors: [],
          messages: []
        })
      })
    )
    .mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => ({
          result: [domains[0]],
          result_info: { page: 1, per_page: 1, total_pages: 3, count: 1, total_count: 3 },
          success: true,
          errors: [],
          messages: []
        })
      })
    )
    .mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => ({
          result: [domains[1]],
          result_info: { page: 2, per_page: 1, total_pages: 3, count: 1, total_count: 3 },
          success: true,
          errors: [],
          messages: []
        })
      })
    )
    .mockResolvedValueOnce(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => ({
          result: [domains[2]],
          result_info: { page: 1, per_page: 1, total_pages: 3, count: 1, total_count: 3 },
          success: true,
          errors: [],
          messages: []
        })
      })
    )
})

describe("environment", () => {

  test("CLOUDFLARE_ACCOUNT_ID exists", async () => {
    const request = await api({ token: CLOUDFLARE_API_TOKEN, path: '/accounts'});
    const data = await request.json();
    const account = data.result.filter((account) => account.id === CLOUDFLARE_ACCOUNT_ID);
    expect(account.length).toBe(1);
    expect(account[0].id).toBe(CLOUDFLARE_ACCOUNT_ID);
  })

})

describe("paging", () => {

  test("all non-paged results are pulled", async () => {
    const request = await api({ token: CLOUDFLARE_API_TOKEN, path: '/zones'});
    const data = await request.json();
    expect(data.result).toStrictEqual(domains);
  })

  test("single page results are not paged", async () => {
    const firstRequest = await api({ token: CLOUDFLARE_API_TOKEN, path: '/zones?page=1'});
    const firstData = await firstRequest.json();
    expect(firstData.result[0]).toStrictEqual(domains[0]);
    const secondRequest = await api({ token: CLOUDFLARE_API_TOKEN, path: '/zones?page=2'});
    const secondData = await secondRequest.json();
    expect(secondData.result[0]).toStrictEqual(domains[1]);
    const thirdRequest = await api({ token: CLOUDFLARE_API_TOKEN, path: '/zones?page=3'});
    const thirdData = await thirdRequest.json();
    expect(thirdData.result[0]).toStrictEqual(domains[2]);
  })

})
