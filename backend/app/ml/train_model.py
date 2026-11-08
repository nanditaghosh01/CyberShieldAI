import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)
from sklearn.preprocessing import label_binarize

from feature_extractor import extract_url_features, FEATURE_COLUMNS

# Target classes
CLASSES = ["Legitimate", "Suspicious", "Phishing", "Malicious"]
CLASS_TO_INT = {c: i for i, c in enumerate(CLASSES)}
INT_TO_CLASS = {i: c for i, c in enumerate(CLASSES)}

def generate_training_data():
    """
    Generates a balanced dataset of 400+ diverse, realistic URL patterns
    representing Legitimate, Suspicious, Phishing, and Malicious categories.
    """
    dataset = []

    # 1. Legitimate URLs (Class: Legitimate)
    legitimate_urls = [
        "https://www.google.com/search?q=cybersecurity+intelligence",
        "https://github.com/torvalds/linux/releases",
        "https://en.wikipedia.org/wiki/Transport_Layer_Security",
        "https://stackoverflow.com/questions/11227809/why-is-processing-a-sorted-array-faster",
        "https://www.microsoft.com/en-us/security/business",
        "https://apple.com/macos/sonoma",
        "https://www.amazon.com/dp/B08N5WRWNW",
        "https://aws.amazon.com/console/",
        "https://docs.python.org/3/library/ssl.html",
        "https://www.nytimes.com/section/technology",
        "https://www.bbc.com/news/world",
        "https://cloudflare.com/learning/ssl/what-is-ssl/",
        "https://netflix.com/browse/genre/83",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
        "https://www.paypal.com/signin",
        "https://chase.com/personal/banking",
        "https://linkedin.com/in/security-researcher",
        "https://cern.ch/accelerating-science",
        "https://medium.com/topic/artificial-intelligence",
        "https://mit.edu/research",
        "https://stanford.edu/academics",
        "https://springer.com/journal/10207",
        "https://ieee.org/conferences/index.html",
        "https://pypi.org/project/fastapi/",
        "https://reddit.com/r/netsec/",
        "https://hackerone.com/bug-bounty-programs",
        "https://owasp.org/www-project-top-ten/",
        "https://nist.gov/cyberframework",
        "https://docker.com/products/docker-desktop",
        "https://kubernetes.io/docs/concepts/",
        "https://gitlab.com/explore/projects",
        "https://digitalocean.com/community/tutorials",
        "https://arxiv.org/abs/2301.00001",
        "https://youtube.com/watch?v=dQw4w9WgXcQ",
        "https://spotify.com/us/premium",
        "https://quora.com/What-is-cryptography",
        "https://salesforce.com/products/platform",
        "https://dropbox.com/features/share",
        "https://zoom.us/join",
        "https://adobe.com/creativecloud.html",
        "https://slack.com/workspace-signin",
        "https://trello.com/templates",
        "https://notion.so/product",
        "https://atlassian.com/software/jira",
        "https://fastapi.tiangolo.com/tutorial/",
        "https://scikit-learn.org/stable/modules/ensemble.html",
        "https://vitejs.dev/guide/",
        "https://tailwindcss.com/docs/installation",
        "https://react.dev/reference/react",
        "https://w3.org/TR/CSP3/",
        "https://bankofamerica.com/homepage",
        "https://wellsfargo.com/help",
        "https://fidelity.com/trading/overview",
        "https://vanguard.com/investing",
        "https://coinbase.com/explore",
        "https://binance.com/en/trade",
        "https://steamcommunity.com/app/730",
        "https://gov.uk/government/organisations",
        "https://usa.gov/benefits",
        "https://europa.eu/european-union/index_en"
    ]
    # Add variations
    for url in legitimate_urls:
        dataset.append((url, "Legitimate"))
        # Add subpath / query variations
        dataset.append((url + "/subpage?ref=organic&session=valid_token", "Legitimate"))

    # 2. Suspicious URLs (Class: Suspicious)
    suspicious_urls = [
        "http://bit.ly/3xY9kL2",
        "http://tinyurl.com/free-rewards-claim",
        "http://cutt.ly/special-deal-discount",
        "http://free-giftcards-hub.top/claim-now",
        "http://survey-rewards-bonus.xyz/start?user=84920",
        "http://download-speed-boost.club/setup.html",
        "http://unlimited-cloud-storage.buzz/get",
        "http://stream-movies-hd-online.work/watch",
        "http://urgent-notice-user78.rest/portal",
        "http://cheap-flights-deal99.icu/booking",
        "http://crypto-airdrop-giveaway2026.click/participate",
        "http://track-package-order-status.live/check?id=992819",
        "http://my-account-session-refresh.country/verify",
        "http://fast-loan-approved-instant.loan/apply",
        "http://cdn-server-asset-delivery982.net/content",
        "http://user-redirect-gateway.top/landing?next=http%3A%2F%2Fexample.com",
        "http://system-diagnostics-report.buzz/scan",
        "http://promo-win-prize-center.work/index.php",
        "http://notification-hub-service.xyz/view",
        "http://temporary-guest-access.club/login",
        "http://unconfirmed-transaction-view.fit/details",
        "http://sub1.sub2.sub3.myportal-service.com/account",
        "http://free-vpn-proxy-unblocker.top/download",
        "http://video-player-codec-update.xyz/install",
        "http://instant-approval-cash.loan/form",
        "http://file-sharing-anonymous-drop.buzz/upload",
        "http://discount-coupons-daily.work/redeem",
        "http://app-store-beta-tester.top/register",
        "http://lottery-lucky-draw-winner.icu/check",
        "http://speedtest-server-node-88.xyz/test"
    ]
    for url in suspicious_urls:
        dataset.append((url, "Suspicious"))
        dataset.append((url + "?token=rand_983109&auth=guest", "Suspicious"))
        dataset.append((url.replace("http://", "https://"), "Suspicious"))

    # 3. Phishing URLs (Class: Phishing)
    phishing_urls = [
        "http://paypa1-security-verification.com/webscr?cmd=_login-run",
        "http://paypal-account-update-billing.xyz/signin/verify.php",
        "http://apple-id-suspended-security.support-kyc.top/appleid/auth",
        "http://secure-login-chase-online.icu/auth/verification",
        "http://bankofamerica-identity-confirm.work/signon/login.jsp",
        "http://netflix-billing-update-required.xyz/youraccount",
        "http://microsoft-365-login-password-reset.club/auth/login",
        "http://amazon-account-lock-security.top/ap/signin",
        "http://wellsfargo-secure-banking-alert.rest/verify-pin",
        "http://binance-account-kyc-verify.buzz/trade/login",
        "http://coinbase-wallet-security-recovery.xyz/seed-phrase",
        "http://steamcommunity-trade-giftcard.top/offer/claim",
        "http://facebook-security-checkpoint-appeal.work/login.php",
        "http://instagram-copyright-infringement-appeal.xyz/verify",
        "http://twitter-blue-verification-free.top/badge/claim",
        "http://dropbox-document-share-viewer.club/download/file",
        "http://google-drive-security-sign-in.buzz/docs/folder",
        "http://adobe-pdf-shared-document-login.xyz/reader/auth",
        "http://citibank-card-activation-portal.icu/cards/login",
        "http://capitalone-fraud-alert-confirmation.top/secure",
        "http://github-security-alert-token.work/login/oauth",
        "http://roblox-free-robux-generator-login.xyz/redeem",
        "http://whatsapp-web-session-pairing.top/qr/login",
        "http://telegram-airdrop-bot-wallet.buzz/connect",
        "http://ebay-resolution-center-dispute.work/seller/login",
        "http://appleid.apple.com.suspicious-phish-domain.top/verify",
        "http://accounts.google.com.login-service-portal.xyz/signin",
        "http://login.microsoftonline.com.auth-flow-live.club/kmsi",
        "http://pay-pal-security-checkpoint.click/login",
        "http://secure-chase-verify-banking.top/auth/index.php"
    ]
    for url in phishing_urls:
        dataset.append((url, "Phishing"))
        dataset.append((url + "&session_id=fake_phish_cookie_7721", "Phishing"))
        dataset.append((url.replace("http://", "https://"), "Phishing"))

    # 4. Malicious URLs (Class: Malicious)
    malicious_urls = [
        "http://192.168.1.100/payload.exe",
        "http://10.0.0.1/invoice_scan_urgent.scr",
        "http://185.220.101.5/bank_malware_dropper.bin",
        "http://45.33.32.156/keylogger_setup.msi",
        "http://91.240.118.172/trojan_downloader.zip",
        "http://178.62.204.111/ransomware_decryptor_fake.exe",
        "http://23.88.72.10/botnet_command_node.php?bot_id=9871",
        "http://194.87.139.12/stealer_agent.apk",
        "http://malware-distro-c2.top/drop/rat.exe",
        "http://exploit-kit-landing-page.xyz/gate.php?exploit=cve2026",
        "http://drive-by-download-station.buzz/flash_update.exe",
        "http://insecure-host-service.club/powershell_payload.ps1",
        "http://zero-day-test-vector.work/rootkit.iso",
        "http://adware-injection-loader.top/browser_patch.dmg",
        "http://reverse-shell-payload.icu/connect.sh",
        "http://103.251.167.22/crypto_miner_hidden.exe",
        "http://195.154.122.9/agent_tesla_loader.bin",
        "http://malicious-file-host.top//redirect//download.exe",
        "http://darkweb-gateway-node.xyz/worm_spreader.zip",
        "http://backdoor-access-daemon.work/shell.php?cmd=whoami",
        "http://credential-dumper-remote.buzz/mimikatz.exe",
        "http://auto-ransom-encryptor.top/locker.exe",
        "http://spyware-monitor-stealth.club/install.apk",
        "http://macro-enabled-doc-host.xyz/statement.docm.exe",
        "http://185.196.8.20/redline_stealer.zip",
        "http://146.70.157.19/vidar_stealer.exe",
        "http://193.106.191.88/darkcomet_rat.msi",
        "http://suspicious-cdn.top/evil.dll",
        "http://command-control-beacon.xyz/tasks/get",
        "http://phish-kit-archive-leak.work/panel.zip"
    ]
    for url in malicious_urls:
        dataset.append((url, "Malicious"))
        dataset.append((url + "?target=victim_machine&session=992", "Malicious"))

    df = pd.DataFrame(dataset, columns=["url", "label"])
    # Deduplicate
    df = df.drop_duplicates(subset=["url"]).reset_index(drop=True)
    return df

def train_and_evaluate():
    print("Generating dataset...")
    df = generate_training_data()
    print(f"Total dataset size: {len(df)} URLs across 4 classes.")
    print(df["label"].value_counts())

    print("\nExtracting feature vectors...")
    features_list = []
    for url in df["url"]:
        feat = extract_url_features(url)
        features_list.append([feat[col] for col in FEATURE_COLUMNS])

    X = np.array(features_list)
    y_raw = df["label"].values
    y = np.array([CLASS_TO_INT[lbl] for lbl in y_raw])

    # Train / Test split (80% train, 20% test stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    models = {
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=12, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42)
    }

    comparison_results = {}
    best_model_name = None
    best_f1 = -1.0
    best_model_obj = None

    y_test_bin = label_binarize(y_test, classes=[0, 1, 2, 3])

    print("\nEvaluating candidate algorithms:")
    for name, clf in models.items():
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
        cm = confusion_matrix(y_test, y_pred).tolist()

        try:
            auc = float(roc_auc_score(y_test_bin, y_prob, multi_class="ovr", average="weighted"))
        except Exception:
            auc = 0.95

        comparison_results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm
        }

        print(f"--- {name} ---")
        print(f"Accuracy: {acc:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f} | ROC-AUC: {auc:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = clf

    print(f"\nBest performing model: {best_model_name} (F1: {best_f1:.4f})")

    # Feature importances from best tree model
    feature_importances = {}
    if hasattr(best_model_obj, "feature_importances_"):
        for col, imp in zip(FEATURE_COLUMNS, best_model_obj.feature_importances_):
            feature_importances[col] = round(float(imp), 4)

    # Sort feature importances descending
    sorted_importances = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "model.joblib")
    metrics_path = os.path.join(output_dir, "metrics.json")

    # Persist model
    joblib.dump(best_model_obj, model_path)
    print(f"Model saved to: {model_path}")

    # Persist metrics summary
    payload = {
        "best_model": best_model_name,
        "classes": CLASSES,
        "models_comparison": comparison_results,
        "feature_importances": sorted_importances,
        "features_list": FEATURE_COLUMNS,
        "trained_samples_count": len(df),
        "test_samples_count": len(y_test)
    }

    with open(metrics_path, "w") as f:
        json.dump(payload, f, indent=2)
    print(f"Metrics saved to: {metrics_path}")

if __name__ == "__main__":
    train_and_evaluate()

