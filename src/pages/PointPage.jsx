import { useState, useEffect } from "react";
import api from "../api/axios";
import styles from "../styles/PointPage.module.css";

export default function PointPage() {
  const [tab, setTab] = useState("내역");
  const [payment, setPayment] = useState({});
  const [point, setPoint] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const storeId = import.meta.env.VITE_PORTONE_STORE_ID;
  const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY;

  const history = [
    {
      id: 1,
      type: "충전",
      amount: 10000,
      desc: "포인트 충전",
      date: "2026.04.13",
    },
    {
      id: 2,
      type: "사용",
      amount: -500,
      desc: "작품 소장 - 어느 날 나는 용사가 되었다 5화",
      date: "2026.04.12",
    },
    {
      id: 3,
      type: "관리자 지급",
      amount: 1000,
      desc: "이벤트 지급",
      date: "2026.04.10",
    },
    {
      id: 4,
      type: "사용",
      amount: -500,
      desc: "작품 소장 - 달빛 아래 로맨스 12화",
      date: "2026.04.08",
    },
    {
      id: 5,
      type: "충전",
      amount: 3000,
      desc: "포인트 충전",
      date: "2026.04.05",
    },
    {
      id: 6,
      type: "사용",
      amount: -500,
      desc: "작품 소장 - 최강 무협전 30화",
      date: "2026.04.01",
    },
  ];

  const packages = [
    { point: 1000, price: 1000 },
    { point: 3000, price: 2900 },
    { point: 5000, price: 4500 },
    { point: 10000, price: 8900 },
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.async = true;
    document.head.appendChild(script);

    const loadWalletBalance = async () => {
      try {
        const response = await api.get("/api/wallets/balance");
        console.log("포인트 잔액 불러오기 : ", response.data);
        setWalletBalance(response.data);
      } catch (error) {
        console.error("포인트 잔액 불러오기 실패 : ", error);
      }
    };
    loadWalletBalance();
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const handleCharge = async (pkg) => {
    try {
      const response = await api.post(
        `/api/payments/prepare?amount=${pkg.price}`,
      );
      const payment = response.data;

      const { IMP } = window;
      if (!IMP) {
        alert("결제 모듈을 불러오는 중입니다.");
        return;
      }
      IMP.init(storeId);

      IMP.request_pay(
        {
          pg: "kakaopay.TC0ONETIME",
          pay_method: "card",
          merchant_uid: payment.merchantUid,
          name: `${pkg.point}P 충전`,
          amount: pkg.price,
        },
        async (rsp) => {
          console.log("포트원 콜백 rsp:", rsp);
          if (rsp.success) {
            await api.post("/api/payments/verify", {
              impUid: rsp.imp_uid,
              merchantUid: rsp.merchant_uid,
            });
            alert(`${pkg.point.toLocaleString()}P 충전 완료!`);
            const balanceRes = await api.get("/api/wallets/balance");
            setWalletBalance(balanceRes.data);
          } else {
            alert(`결제 실패: ${rsp.error_msg}`);
          }
        },
      );
    } catch (error) {
      console.error("결제 실패 : ", error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>포인트</div>
        <div className={styles.pointDisplay}>
          <span className={styles.pointValue}>
            {walletBalance.toLocaleString()}
          </span>
          <span className={styles.pointLabel}>P 보유</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tabGroup}>
          {["충전", "내역"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "충전" && (
          <div className={styles.packageGrid}>
            {packages.map((pkg) => (
              <div key={pkg.point} className={styles.packageCard}>
                <div className={styles.packagePoint}>
                  {pkg.point.toLocaleString()} P
                </div>
                <div className={styles.packagePrice}>
                  {pkg.price.toLocaleString()}원
                </div>
                <button
                  className={styles.chargeBtn}
                  onClick={() => handleCharge(pkg)}
                >
                  충전하기
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "내역" &&
          history.map((h) => (
            <div key={h.id} className={styles.historyItem}>
              <div>
                <div className={styles.historyDesc}>{h.desc}</div>
                <div className={styles.historyDate}>{h.date}</div>
              </div>
              <div
                className={`${styles.historyAmount} ${h.amount > 0 ? styles.amountPlus : styles.amountMinus}`}
              >
                {h.amount > 0 ? "+" : ""}
                {h.amount.toLocaleString()} P
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
