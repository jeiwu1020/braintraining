import { RotateCw, Share2, Smartphone } from 'lucide-react';

const MobileLandscapeGate = () => (
  <div
    className="mobile-landscape-gate"
    data-mobile-landscape-gate="true"
    role="dialog"
    aria-modal="true"
    aria-labelledby="mobile-landscape-gate-title"
  >
    <div className="mobile-landscape-gate__card">
      <div className="mobile-landscape-gate__icon" aria-hidden="true">
        <Smartphone className="mobile-landscape-gate__phone" strokeWidth={1.8} />
        <RotateCw className="mobile-landscape-gate__rotate" strokeWidth={2.2} />
      </div>

      <h1 id="mobile-landscape-gate-title">請將手機轉為橫向</h1>
      <p className="mobile-landscape-gate__message">
        本遊戲以手機橫向操作設計，旋轉後即可繼續遊玩。
      </p>

      <div className="mobile-landscape-gate__install" aria-label="網頁 App 使用建議">
        <Share2 aria-hidden="true" />
        <p>
          想獲得最佳效果，可在瀏覽器選擇「分享」→「加入主畫面」，再從桌面 App 模式開啟。
        </p>
      </div>

      <p className="mobile-landscape-gate__note">
        如果螢幕旋轉被鎖定，請先解除旋轉鎖定。
      </p>
    </div>
  </div>
);

export default MobileLandscapeGate;
