import { useState, useEffect } from "react";
import api from "../api/axios";
import styles from "../styles/PointPage.module.css";

export default function PointPage() {
  const [tab, setTab] = useState("충전");
  const [payment, setPayment] = useState({});
  const [point, setPoint] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const storeId = import.meta.env.VITE_PORTONE_STORE_ID;
  const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY;
  const [history, setHistory] = useState([])

  const packages = [
    { point: 1000, price: 1000 },
    { point: 3000, price: 2900 },
    { point: 5000, price: 4500 },
    { point: 10000, price: 8900 },
  ];

  const loadPointHistory = async () => {
      try {
          const response = await api.get("/api/points")
          const data = Array.isArray(response.data) ? response.data : []
          setHistory(data)
          console.log("포인트 내역:", data)
      } catch (error) {
          console.error("포인트 내역 불러오기 실패 : ", error)
      }
    }

  const handleCancel = async (paymentId) => {
    if (!window.confirm("결제를 취소하시겠습니까?")) return
    try {
        await api.post(`/api/payments/${paymentId}/cancel`)
        alert("취소되었습니다.")
        const balanceRes = await api.get("/api/wallets/balance")
        setWalletBalance(balanceRes.data)
        await loadPointHistory()
    } catch (error) {
        if (error.response?.data?.includes("사용한 포인트")) {
            alert("사용한 포인트가 있어 취소할 수 없습니다.")
        } else {
            alert("취소에 실패했습니다.")
        }
        console.error("취소 실패 : ", error)
    }
}

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
    loadPointHistory()
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const handleCharge = async (pkg) => {
    try {
      const response = await api.post(
        `/api/payments/prepare?amount=${pkg.price}&pointAmount=${pkg.point}`)
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
            await loadPointHistory();
          } else {
            alert(`결제 실패: ${rsp.error_msg}`);
          }
        },
      );
    } catch (error) {
      if (error.response?.status === 400) {
        alert("결제 검증에 실패했습니다. 고객센터에 문의해주세요.")
      } else {
          alert("결제 중 오류가 발생했습니다.")
      }
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
            <div key={h.pointId} className={styles.historyItem}>
                <div>
                    <div className={styles.historyDesc}>{h.description}</div>
                    <div className={styles.historyDate}>
                        {new Date(h.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div className={`${styles.historyAmount} ${h.pointType === "CHARGE" ? styles.amountPlus : styles.amountMinus}`}>
                    {h.pointType === "CHARGE" ? "+" : "-"}
                    {h.amount.toLocaleString()} P
                </div>
                {h.pointType === "CHARGE" && h.payment?.status === "COMPLETE" && (
                    <button
                        className={styles.cancelBtn}
                        onClick={() => handleCancel(h.payment.paymentId)}
                    >
                        취소
                    </button>
                )}
            </div>
        ))
    }
      </div>
    </div>
  );
}
