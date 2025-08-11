import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

interface StoreData {
  id: string;
  name: string;
  address: string;
  hasSeating: "yes" | "no" | "unknown";
  lastUpdated: string;
  reportedBy?: string;
  notes?: string;
}

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("*", logger(console.log));

// 모든 편의점 조회
app.get("/make-server-3e44bc02/stores", async (c) => {
  try {
    console.log("편의점 목록 조회 요청");

    const stores = await kv.getByPrefix("store:");
    console.log(`${stores.length}개의 편의점 데이터 조회됨`);

    const storeList = stores.map(
      (store) => store.value as StoreData,
    );

    // 최신 업데이트 순으로 정렬
    storeList.sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() -
        new Date(a.lastUpdated).getTime(),
    );

    return c.json(storeList);
  } catch (error) {
    console.error("편의점 목록 조회 중 오류:", error);
    return c.json(
      {
        error: "편의점 목록을 조회하는 중 오류가 발생했습니다.",
      },
      500,
    );
  }
});

// 새 편의점 정보 추가
app.post("/make-server-3e44bc02/stores", async (c) => {
  try {
    console.log("새 편의점 정보 제보 요청");

    const body = await c.req.json();
    const { name, address, hasSeating, reporterName, notes } =
      body;

    if (!name || !address) {
      return c.json(
        { error: "편의점 이름과 주소는 필수 입력 항목입니다." },
        400,
      );
    }

    // 중복 체크
    const existingStores = await kv.getByPrefix("store:");
    const duplicate = existingStores.find((store) => {
      const storeData = store.value as StoreData;
      return (
        storeData.name.toLowerCase() === name.toLowerCase() &&
        storeData.address.toLowerCase() ===
          address.toLowerCase()
      );
    });

    if (duplicate) {
      const existingStore = duplicate.value as StoreData;
      const updatedStore: StoreData = {
        ...existingStore,
        hasSeating: hasSeating || existingStore.hasSeating,
        lastUpdated: new Date().toISOString(),
        reportedBy:
          reporterName || existingStore.reportedBy || "익명",
        notes: notes || existingStore.notes,
      };

      await kv.set(duplicate.key, updatedStore);
      console.log(`기존 편의점 정보 업데이트: ${name}`);

      return c.json(updatedStore);
    }

    // 새 편의점 추가
    const storeId = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStore: StoreData = {
      id: storeId,
      name: name.trim(),
      address: address.trim(),
      hasSeating: hasSeating || "unknown",
      lastUpdated: new Date().toISOString(),
      reportedBy: reporterName?.trim() || "익명",
      notes: notes?.trim() || "",
    };

    await kv.set(`store:${storeId}`, newStore);
    console.log(`새 편의점 정보 추가: ${name}`);

    return c.json(newStore, 201);
  } catch (error) {
    console.error("편의점 정보 제보 중 오류:", error);
    return c.json(
      {
        error: "편의점 정보를 저장하는 중 오류가 발생했습니다.",
      },
      500,
    );
  }
});

// 특정 편의점 정보 조회
app.get("/make-server-3e44bc02/stores/:id", async (c) => {
  try {
    const storeId = c.req.param("id");
    console.log(`편의점 정보 조회 요청: ${storeId}`);

    const store = await kv.get(`store:${storeId}`);

    if (!store) {
      return c.json(
        { error: "편의점을 찾을 수 없습니다." },
        404,
      );
    }

    return c.json(store);
  } catch (error) {
    console.error("편의점 정보 조회 중 오류:", error);
    return c.json(
      {
        error: "편의점 정보를 조회하는 중 오류가 발생했습니다.",
      },
      500,
    );
  }
});

// 편의점 정보 업데이트
app.put("/make-server-3e44bc02/stores/:id", async (c) => {
  try {
    const storeId = c.req.param("id");
    const body = await c.req.json();

    console.log(`편의점 정보 업데이트 요청: ${storeId}`);

    const existingStore = await kv.get(`store:${storeId}`);

    if (!existingStore) {
      return c.json(
        { error: "편의점을 찾을 수 없습니다." },
        404,
      );
    }

    const updatedStore: StoreData = {
      ...(existingStore as StoreData),
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    await kv.set(`store:${storeId}`, updatedStore);
    console.log(`편의점 정보 업데이트 완료: ${storeId}`);

    return c.json(updatedStore);
  } catch (error) {
    console.error("편의점 정보 업데이트 중 오류:", error);
    return c.json(
      {
        error:
          "편의점 정보를 업데이트하는 중 오류가 발생했습니다.",
      },
      500,
    );
  }
});

// 헬스 체크 엔드포인트
app.get("/make-server-3e44bc02/health", (c) => {
  return c.json({
    status: "ok",
    message: "편의점 좌석 정보 서버가 정상 작동 중입니다.",
  });
});

// 초기 샘플 데이터 추가
app.post(
  "/make-server-3e44bc02/init-sample-data",
  async (c) => {
    try {
      console.log("샘플 데이터 초기화 요청");

      const sampleStores: StoreData[] = [
        {
          id: "sample_1",
          name: "세븐일레븐 강남역점",
          address: "서울특별시 강남구 강남대로 지하 396",
          hasSeating: "yes",
          lastUpdated: new Date().toISOString(),
          reportedBy: "관리자",
          notes: "2인용 테이블 3개, 4인용 테이블 2개",
        },
        {
          id: "sample_2",
          name: "CU 홍대입구역점",
          address: "서울특별시 마포구 양화로 지하 188",
          hasSeating: "no",
          lastUpdated: new Date().toISOString(),
          reportedBy: "관리자",
          notes: "서서 취식할 수 있는 높은 테이블만 있음",
        },
        {
          id: "sample_3",
          name: "GS25 신촌점",
          address: "서울특별시 서대문구 신촌로 134",
          hasSeating: "yes",
          lastUpdated: new Date().toISOString(),
          reportedBy: "관리자",
          notes: "창가쪽 2인용 테이블 4개",
        },
        {
          id: "sample_4",
          name: "emart24 역삼점",
          address: "서울특별시 강남구 역삼동 678-9",
          hasSeating: "unknown",
          lastUpdated: new Date().toISOString(),
          reportedBy: "",
          notes: "",
        },
      ];

      for (const store of sampleStores) {
        await kv.set(`store:${store.id}`, store);
      }

      console.log("샘플 데이터 초기화 완료");
      return c.json({
        message: "샘플 데이터가 추가되었습니다.",
        count: sampleStores.length,
      });
    } catch (error) {
      console.error("샘플 데이터 초기화 중 오류:", error);
      return c.json(
        { error: "샘플 데이터 초기화 중 오류가 발생했습니다." },
        500,
      );
    }
  },
);

Deno.serve(app.fetch);