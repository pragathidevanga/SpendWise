import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, date
import json

# Page Configuration
st.set_page_config(
    page_title="SpendWise — Smart Personal Finance",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for SaaS polish
st.markdown("""
<style>
    .metric-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 15px;
    }
    .stProgress > div > div > div > div {
        background-color: #6366f1;
    }
    .badge-income {
        background-color: #d1fae5;
        color: #065f46;
        padding: 3px 8px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .badge-expense {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 3px 8px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.8rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize Session State Data
if "currency" not in st.session_state:
    st.session_state.currency = "₹"

if "transactions" not in st.session_state:
    today_str = date.today().strftime("%Y-%m-%d")
    st.session_state.transactions = [
        {"id": "tx_1", "date": today_str, "title": "Tech Monthly Salary", "amount": 85000.0, "type": "Income", "category": "Salary", "method": "Net Banking", "notes": "Primary payroll"},
        {"id": "tx_2", "date": today_str, "title": "Apartment Rent", "amount": 24000.0, "type": "Expense", "category": "Housing & Rent", "method": "Net Banking", "notes": "NEFT transfer"},
        {"id": "tx_3", "date": today_str, "title": "Groceries & Supermarket", "amount": 5200.0, "type": "Expense", "category": "Food & Dining", "method": "Credit Card", "notes": "Organic supplies"},
        {"id": "tx_4", "date": today_str, "title": "Freelance UI Consulting", "amount": 18000.0, "type": "Income", "category": "Freelance", "method": "UPI", "notes": "Client project"},
        {"id": "tx_5", "date": today_str, "title": "Electricity & WiFi", "amount": 3400.0, "type": "Expense", "category": "Utilities", "method": "UPI", "notes": "Bescom + Fiber"},
        {"id": "tx_6", "date": today_str, "title": "Fuel & Transportation", "amount": 2600.0, "type": "Expense", "category": "Transportation", "method": "Debit Card", "notes": "Petrol & Metro"}
    ]

if "budgets" not in st.session_state:
    st.session_state.budgets = [
        {"category": "Housing & Rent", "limit": 25000.0},
        {"category": "Food & Dining", "limit": 12000.0},
        {"category": "Utilities", "limit": 5000.0},
        {"category": "Transportation", "limit": 6000.0},
        {"category": "Entertainment", "limit": 4000.0}
    ]

if "goals" not in st.session_state:
    st.session_state.goals = [
        {"name": "Emergency Reserve Fund", "target": 250000.0, "current": 185000.0, "category": "Safety"},
        {"name": "New Developer Laptop", "target": 150000.0, "current": 110000.0, "category": "Electronics"},
        {"name": "Vacation Trekking Trip", "target": 45000.0, "current": 32000.0, "category": "Travel"}
    ]

curr = st.session_state.currency

# Sidebar Navigation
st.sidebar.markdown(f"## 💳 **SpendWise** PRO")
st.sidebar.caption("Smart Personal Finance Manager")

menu = st.sidebar.radio(
    "Navigation Menu",
    ["📊 Financial Overview", "💳 Transactions Ledger", "🎯 Budget Planner", "🏆 Savings Goals", "📈 Analytics & Insights", "⚙️ Preferences & Backup"]
)

# ----------------- PAGE 1: FINANCIAL OVERVIEW -----------------
if menu == "📊 Financial Overview":
    st.title("📊 Financial Overview")
    st.caption("Live cash flow, budget remaining, and recent ledger activity.")

    # Calculations
    df_tx = pd.DataFrame(st.session_state.transactions)
    if not df_tx.empty:
        total_income = df_tx[df_tx["type"] == "Income"]["amount"].sum()
        total_expenses = df_tx[df_tx["type"] == "Expense"]["amount"].sum()
    else:
        total_income = 0.0
        total_expenses = 0.0

    net_balance = total_income - total_expenses
    savings_rate = (net_balance / total_income * 100) if total_income > 0 else 0

    # Total budget limit vs spent
    total_budget_limit = sum(b["limit"] for b in st.session_state.budgets)
    budget_cat_spent = df_tx[df_tx["type"] == "Expense"].groupby("category")["amount"].sum().to_dict() if not df_tx.empty else {}
    total_budget_spent = sum(budget_cat_spent.get(b["category"], 0.0) for b in st.session_state.budgets)
    remaining_budget = max(0.0, total_budget_limit - total_budget_spent)

    # 4 Top KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Net Balance", f"{curr}{net_balance:,.2f}", f"{savings_rate:.1f}% savings rate")
    col2.metric("Total Income", f"{curr}{total_income:,.2f}", "Inflows")
    col3.metric("Total Expenses", f"{curr}{total_expenses:,.2f}", "Outflows", delta_color="inverse")
    col4.metric("Remaining Budget", f"{curr}{remaining_budget:,.2f}", f"of {curr}{total_budget_limit:,.0f} cap")

    st.markdown("---")

    # Quick Add Transaction
    with st.expander("➕ **Quick Record Transaction**", expanded=False):
        with st.form("quick_add_form"):
            q_cols = st.columns([2, 1, 1, 1])
            q_title = q_cols[0].text_input("Title / Description", placeholder="e.g. Grocery bill")
            q_amount = q_cols[1].number_input(f"Amount ({curr})", min_value=1.0, step=100.0)
            q_type = q_cols[2].selectbox("Type", ["Expense", "Income"])
            q_cat = q_cols[3].selectbox("Category", [
                "Food & Dining", "Housing & Rent", "Shopping & Groceries", "Utilities",
                "Transportation", "Entertainment", "Salary", "Freelance", "Investment", "Other"
            ])
            q_submit = st.form_submit_button("Record Entry", use_container_width=True)
            if q_submit:
                if q_title.strip():
                    new_item = {
                        "id": f"tx_{int(datetime.now().timestamp())}",
                        "date": date.today().strftime("%Y-%m-%d"),
                        "title": q_title.strip(),
                        "amount": float(q_amount),
                        "type": q_type,
                        "category": q_cat,
                        "method": "UPI / Card",
                        "notes": "Added via Overview"
                    }
                    st.session_state.transactions.insert(0, new_item)
                    st.success(f"Added {q_type}: {q_title} ({curr}{q_amount:,.2f})")
                    st.rerun()
                else:
                    st.error("Please enter a valid title.")

    # Charts Row
    c1, c2 = st.columns([1.3, 1])
    with c1:
        st.subheader("Cash Flow Distribution")
        if not df_tx.empty and total_income + total_expenses > 0:
            cf_df = pd.DataFrame([
                {"Flow": "Income", "Amount": total_income},
                {"Flow": "Expenses", "Amount": total_expenses}
            ])
            fig_cf = px.bar(
                cf_df, x="Flow", y="Amount", color="Flow",
                color_discrete_map={"Income": "#10b981", "Expenses": "#ef4444"},
                text_auto=".2s"
            )
            fig_cf.update_layout(height=280, showlegend=False, margin=dict(t=20, b=20, l=20, r=20))
            st.plotly_chart(fig_cf, use_container_width=True)
        else:
            st.info("No transaction data available.")

    with c2:
        st.subheader("Expenses by Category")
        expense_df = df_tx[df_tx["type"] == "Expense"] if not df_tx.empty else pd.DataFrame()
        if not expense_df.empty:
            cat_summary = expense_df.groupby("category")["amount"].sum().reset_index()
            fig_pie = px.pie(
                cat_summary, names="category", values="amount", hole=0.5,
                color_discrete_sequence=px.colors.qualitative.Plotly
            )
            fig_pie.update_layout(height=280, margin=dict(t=20, b=20, l=20, r=20))
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.info("No expense categories recorded.")

    # Recent Transactions Table
    st.subheader("Recent Transactions")
    if not df_tx.empty:
        display_df = df_tx[["date", "title", "category", "type", "amount", "method"]].copy()
        display_df["amount"] = display_df.apply(lambda r: f"+{curr}{r['amount']:,.2f}" if r["type"] == "Income" else f"-{curr}{r['amount']:,.2f}", axis=1)
        st.dataframe(display_df.head(6), use_container_width=True, hide_index=True)
    else:
        st.info("No transactions recorded yet.")

# ----------------- PAGE 2: TRANSACTIONS LEDGER -----------------
elif menu == "💳 Transactions Ledger":
    st.title("💳 Transaction Ledger")
    st.caption("Inspect, filter, search, record, and export credit and debit records.")

    # Controls row
    col_search, col_type, col_cat = st.columns([2, 1, 1])
    search_q = col_search.text_input("🔍 Search title, notes...", "")
    type_f = col_type.selectbox("Filter Type", ["All Types", "Income", "Expense"])
    all_cats = ["All Categories"] + sorted(list(set(t["category"] for t in st.session_state.transactions)))
    cat_f = col_cat.selectbox("Filter Category", all_cats)

    # Filter logic
    filtered = st.session_state.transactions
    if search_q.strip():
        filtered = [t for t in filtered if search_q.lower() in t["title"].lower() or search_q.lower() in t.get("notes", "").lower()]
    if type_f != "All Types":
        filtered = [t for t in filtered if t["type"] == type_f]
    if cat_f != "All Categories":
        filtered = [t for t in filtered if t["category"] == cat_f]

    df_filtered = pd.DataFrame(filtered)

    # Summary ribbon
    if not df_filtered.empty:
        f_income = df_filtered[df_filtered["type"] == "Income"]["amount"].sum()
        f_expense = df_filtered[df_filtered["type"] == "Expense"]["amount"].sum()
        st.info(f"**Filtered Results:** {len(df_filtered)} records | **Income:** +{curr}{f_income:,.2f} | **Expenses:** -{curr}{f_expense:,.2f} | **Net:** {curr}{(f_income - f_expense):,.2f}")
        
        display_f = df_filtered[["date", "title", "category", "type", "amount", "method", "notes"]].copy()
        st.dataframe(display_f, use_container_width=True, hide_index=True)

        # CSV Download Button
        csv_data = df_filtered.to_csv(index=False).encode('utf-8')
        st.download_button(
            "📥 Download Filtered CSV",
            data=csv_data,
            file_name=f"spendwise_transactions_{date.today()}.csv",
            mime="text/csv"
        )
    else:
        st.warning("No transactions match the selected filters.")

    st.markdown("---")
    # Add new record form
    st.subheader("Add New Transaction")
    with st.form("ledger_add_form"):
        r1, r2, r3 = st.columns(3)
        nt_title = r1.text_input("Transaction Title", placeholder="e.g. Electric bill")
        nt_amt = r2.number_input(f"Amount ({curr})", min_value=1.0, step=100.0)
        nt_date = r3.date_input("Date", date.today())

        r4, r5, r6 = st.columns(3)
        nt_type = r4.selectbox("Type", ["Expense", "Income"], key="ledger_type")
        nt_cat = r5.selectbox("Category", [
            "Food & Dining", "Housing & Rent", "Shopping & Groceries", "Utilities",
            "Transportation", "Entertainment", "Healthcare", "Salary", "Freelance", "Investment Returns", "Other"
        ])
        nt_method = r6.selectbox("Payment Method", ["UPI / GPay / PhonePe", "Credit Card", "Debit Card", "Net Banking", "Cash"])
        nt_notes = st.text_input("Notes / Memo", placeholder="Optional details")

        if st.form_submit_button("Save Transaction", use_container_width=True):
            if nt_title.strip():
                st.session_state.transactions.insert(0, {
                    "id": f"tx_{int(datetime.now().timestamp())}",
                    "date": nt_date.strftime("%Y-%m-%d"),
                    "title": nt_title.strip(),
                    "amount": float(nt_amt),
                    "type": nt_type,
                    "category": nt_cat,
                    "method": nt_method,
                    "notes": nt_notes.strip()
                })
                st.success("Transaction saved!")
                st.rerun()
            else:
                st.error("Title is required.")

# ----------------- PAGE 3: BUDGETS -----------------
elif menu == "🎯 Budget Planner":
    st.title("🎯 Category Budget Planner")
    st.caption("Set monthly spending ceilings and monitor utilization in real-time.")

    # Calculate actual spending per category
    df_tx = pd.DataFrame(st.session_state.transactions)
    spent_map = df_tx[df_tx["type"] == "Expense"].groupby("category")["amount"].sum().to_dict() if not df_tx.empty else {}

    for b in st.session_state.budgets:
        cat = b["category"]
        lim = b["limit"]
        spent = spent_map.get(cat, 0.0)
        pct = min(100.0, (spent / lim) * 100.0) if lim > 0 else 0.0
        remaining = max(0.0, lim - spent)
        is_exceeded = spent > lim

        st.markdown(f"### {cat}")
        status_text = f"**{pct:.1f}% used** ({curr}{spent:,.2f} of {curr}{lim:,.2f})"
        if is_exceeded:
            st.error(f"⚠️ {status_text} — Exceeded by {curr}{(spent - lim):,.2f}!")
        elif pct >= 80:
            st.warning(f"⚡ {status_text} — Approaching monthly limit ({curr}{remaining:,.2f} left)")
        else:
            st.info(f"✅ {status_text} — {curr}{remaining:,.2f} remaining")

        st.progress(pct / 100.0)
        st.markdown("---")

    # Add custom budget
    with st.expander("➕ Define New Budget Category"):
        with st.form("add_budget_form"):
            nb_cat = st.text_input("Category Name", placeholder="e.g. Healthcare, Books")
            nb_lim = st.number_input(f"Monthly Limit ({curr})", min_value=100.0, step=500.0, value=5000.0)
            if st.form_submit_button("Add Budget"):
                if nb_cat.strip():
                    st.session_state.budgets.append({"category": nb_cat.strip(), "limit": float(nb_lim)})
                    st.success(f"Created budget for {nb_cat}!")
                    st.rerun()

# ----------------- PAGE 4: SAVINGS GOALS -----------------
elif menu == "🏆 Savings Goals":
    st.title("🏆 Savings Goals & Milestones")
    st.caption("Set target milestones for emergency reserves, gadgets, or vacations.")

    cols = st.columns(len(st.session_state.goals)) if len(st.session_state.goals) <= 3 else st.columns(3)
    for idx, g in enumerate(st.session_state.goals):
        col = cols[idx % len(cols)]
        pct = min(100.0, (g["current"] / g["target"]) * 100.0) if g["target"] > 0 else 0.0
        rem = max(0.0, g["target"] - g["current"])

        with col:
            st.markdown(f"#### {g['name']}")
            st.caption(f"Category: {g.get('category', 'Milestone')}")
            st.metric("Progress", f"{pct:.1f}%", f"{curr}{g['current']:,.0f} / {curr}{g['target']:,.0f}")
            st.progress(pct / 100.0)
            if g["current"] >= g["target"]:
                st.success("🎉 Target Achieved!")
            else:
                st.caption(f"{curr}{rem:,.0f} remaining to reach goal")

    st.markdown("---")
    st.subheader("Manage Savings Contributions")
    c_goal, c_amt, c_action = st.columns([2, 1, 1])
    goal_names = [g["name"] for g in st.session_state.goals]
    sel_goal = c_goal.selectbox("Select Goal", goal_names)
    contrib_amt = c_amt.number_input(f"Amount ({curr})", min_value=50.0, step=500.0, value=1000.0)
    action_type = c_action.selectbox("Action", ["Add Funds", "Withdraw"])

    if st.button("Apply Contribution", use_container_width=True):
        for g in st.session_state.goals:
            if g["name"] == sel_goal:
                if action_type == "Add Funds":
                    g["current"] += float(contrib_amt)
                    st.success(f"Deposited {curr}{contrib_amt:,.2f} into '{sel_goal}'!")
                else:
                    g["current"] = max(0.0, g["current"] - float(contrib_amt))
                    st.info(f"Withdrew {curr}{contrib_amt:,.2f} from '{sel_goal}'.")
                st.rerun()

# ----------------- PAGE 5: ANALYTICS -----------------
elif menu == "📈 Analytics & Insights":
    st.title("📈 Analytics & Insights")
    st.caption("Deep visual cash flow trends and heuristic observations.")

    df_tx = pd.DataFrame(st.session_state.transactions)
    if not df_tx.empty:
        # Time distribution
        df_tx["date"] = pd.to_datetime(df_tx["date"])
        df_sorted = df_tx.sort_values("date")
        daily_summary = df_sorted.groupby(["date", "type"])["amount"].sum().reset_index()

        fig_trend = px.bar(
            daily_summary, x="date", y="amount", color="type",
            color_discrete_map={"Income": "#10b981", "Expense": "#ef4444"},
            title="Chronological Cash Flow",
            barmode="group"
        )
        st.plotly_chart(fig_trend, use_container_width=True)

        # Rule-Based Insights
        st.subheader("💡 Rule-Based Heuristic Observations")
        total_inc = df_tx[df_tx["type"] == "Income"]["amount"].sum()
        total_exp = df_tx[df_tx["type"] == "Expense"]["amount"].sum()
        if total_inc > 0:
            rate = ((total_inc - total_exp) / total_inc) * 100
            if rate >= 30:
                st.success(f"🌟 **Healthy Savings Rate:** You are retaining **{rate:.1f}%** of your total inflows.")
            elif rate > 0:
                st.info(f"ℹ️ **Moderate Cushion:** Current retention rate is **{rate:.1f}%**. Review secondary categories.")
            else:
                st.warning("⚠️ **Deficit Warning:** Recorded expenses exceed total income for this period.")

        expense_df = df_tx[df_tx["type"] == "Expense"]
        if not expense_df.empty:
            top_cat = expense_df.groupby("category")["amount"].sum().idxmax()
            top_cat_amt = expense_df.groupby("category")["amount"].sum().max()
            st.info(f"🔍 **Primary Outlay:** **{top_cat}** represents your largest expenditure at **{curr}{top_cat_amt:,.2f}**.")
    else:
        st.info("No data available for analytics.")

# ----------------- PAGE 6: SETTINGS -----------------
elif menu == "⚙️ Preferences & Backup":
    st.title("⚙️ Preferences & Data Backup")
    st.caption("Manage currency formatting and export your financial ledger.")

    # Currency selection
    new_curr = st.selectbox("Preferred Currency", ["₹ (INR)", "$ (USD)", "€ (EUR)", "£ (GBP)"], index=0)
    if st.button("Save Currency"):
        st.session_state.currency = new_curr.split()[0]
        st.success("Currency updated!")
        st.rerun()

    st.markdown("---")
    st.subheader("Data Export")
    export_payload = {
        "app": "SpendWise Streamlit Edition",
        "exportedAt": str(datetime.now()),
        "currency": st.session_state.currency,
        "transactions": st.session_state.transactions,
        "budgets": st.session_state.budgets,
        "goals": st.session_state.goals
    }
    json_str = json.dumps(export_payload, indent=2)
    st.download_button(
        "💾 Export Complete JSON Backup",
        data=json_str,
        file_name=f"spendwise_backup_{date.today()}.json",
        mime="application/json"
    )
