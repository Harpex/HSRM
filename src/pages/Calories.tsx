import { FormEvent, useState } from "react";
import { Apple, Trash2 } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { useApp } from "../store/AppContext";
import { MealCategory } from "../types";
import { todayIso } from "../utils/date";
import { dailyCalories, mealsForDate, sum } from "../utils/metrics";

const mealLabels: Record<MealCategory, string> = {
  breakfast: "Kahvaltı",
  lunch: "Öğle yemeği",
  dinner: "Akşam yemeği",
  snack: "Atıştırmalık",
};

export const Calories = () => {
  const { state, dispatch } = useApp();
  const [category, setCategory] = useState<MealCategory>("breakfast");
  const [food, setFood] = useState("");
  const [amount, setAmount] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [error, setError] = useState("");
  const meals = mealsForDate(state.meals);
  const totalCalories = dailyCalories(meals);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (food.trim().length < 2 || calories <= 0) {
      setError("Yiyecek adı ve kalori bilgisi gerekli.");
      return;
    }
    dispatch({ type: "ADD_MEAL", payload: { id: "", date: todayIso(), category, food, amount, calories, protein, carbs, fat } });
    setFood("");
    setAmount("");
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setError("");
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Kalori takibi" title="Öğün ve makro dengesi" description="Günlük kalori hedefini ve protein, karbonhidrat, yağ dağılımını izle." />
      <div className="metric-grid">
        <MetricCard title="Toplam kalori" value={totalCalories} detail={`${state.profile.calorieTarget} kcal hedef`} icon={<Apple />} tone="coral" />
        <MetricCard title="Protein" value={`${sum(meals.map((meal) => meal.protein))} g`} detail="Günlük toplam" icon={<Apple />} tone="green" />
        <MetricCard title="Karbonhidrat" value={`${sum(meals.map((meal) => meal.carbs))} g`} detail="Günlük toplam" icon={<Apple />} tone="amber" />
        <MetricCard title="Yağ" value={`${sum(meals.map((meal) => meal.fat))} g`} detail="Günlük toplam" icon={<Apple />} tone="teal" />
      </div>
      <ProgressBar value={Math.round((totalCalories / state.profile.calorieTarget) * 100)} label="Kalori hedefi kullanımı" />
      <div className="content-grid">
        <form className="panel form-grid" onSubmit={submit}>
          <div className="section-title"><h2>Öğün ekle</h2></div>
          <label>Kategori<select value={category} onChange={(event) => setCategory(event.target.value as MealCategory)}>{Object.entries(mealLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Yiyecek<input value={food} onChange={(event) => setFood(event.target.value)} placeholder="Örn. Somon salata" /></label>
          <label>Miktar<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1 porsiyon" /></label>
          <div className="two-col">
            <label>Kalori<input type="number" value={calories} onChange={(event) => setCalories(Number(event.target.value))} /></label>
            <label>Protein<input type="number" value={protein} onChange={(event) => setProtein(Number(event.target.value))} /></label>
          </div>
          <div className="two-col">
            <label>Karbonhidrat<input type="number" value={carbs} onChange={(event) => setCarbs(Number(event.target.value))} /></label>
            <label>Yağ<input type="number" value={fat} onChange={(event) => setFat(Number(event.target.value))} /></label>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button">Öğünü kaydet</button>
        </form>
        <section className="panel">
          <div className="section-title"><h2>Bugünkü öğünler</h2><span>{meals.length} öğün</span></div>
          <div className="task-list">
            {meals.map((meal) => (
              <article className="task-row" key={meal.id}>
                <time>{mealLabels[meal.category]}</time>
                <div><strong>{meal.food}</strong><span>{meal.amount} · {meal.protein}P / {meal.carbs}K / {meal.fat}Y</span></div>
                <strong>{meal.calories} kcal</strong>
                <button className="icon-button" onClick={() => dispatch({ type: "DELETE_MEAL", payload: meal.id })}><Trash2 size={16} /></button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
