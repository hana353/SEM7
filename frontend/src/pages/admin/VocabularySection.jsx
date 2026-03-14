import React, { useState, useEffect } from "react";
import api from "../../api/axios";

function VocabularySection({ topics = [], loading, onRefresh, practiceSessions = 0 }) {
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const [wordForm, setWordForm] = useState({
    word: "",
    meaning: "",
    exampleSentence: "",
  });
  const [savingWord, setSavingWord] = useState(false);

  useEffect(() => {
    if (!selectedTopicId) return;
    setLoadingWords(true);
    api
      .get(`/vocabulary/topics/${selectedTopicId}/words`)
      .then(res => setWords(res.data?.data || []))
      .catch(() => setWords([]))
      .finally(() => setLoadingWords(false));
  }, [selectedTopicId]);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await api.post("/vocabulary/topics", { title: newTitle.trim() });
      setNewTitle("");
      onRefresh?.();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.response?.data?.message || "Lỗi");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectTopic = (topicId) => {
    setSelectedTopicId(topicId);
  };

  const handleWordChange = (field, value) => {
    setWordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!selectedTopicId) {
      // eslint-disable-next-line no-alert
      alert("Vui lòng chọn chủ đề trước");
      return;
    }
    if (!wordForm.word.trim()) {
      // eslint-disable-next-line no-alert
      alert("Từ vựng không được để trống");
      return;
    }
    setSavingWord(true);
    try {
      await api.post(`/vocabulary/topics/${selectedTopicId}/words`, {
        word: wordForm.word.trim(),
        meaning: wordForm.meaning?.trim() || "",
        exampleSentence: wordForm.exampleSentence?.trim() || "",
      });
      setWordForm({ word: "", meaning: "", exampleSentence: "" });
      const res = await api.get(`/vocabulary/topics/${selectedTopicId}/words`);
      setWords(res.data?.data || []);
      onRefresh?.();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.response?.data?.message || "Không thêm được từ");
    } finally {
      setSavingWord(false);
    }
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId) || null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Bộ từ vựng theo chủ đề (FREE)
        </h2>
        <form onSubmit={handleCreateTopic} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Tên chủ đề"
            className="px-3 py-1.5 border rounded text-sm"
          />
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
          >
            + Tạo
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2">Chủ đề</th>
                  <th className="px-4 py-2">Số từ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : topics.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                      Chưa có chủ đề
                    </td>
                  </tr>
                ) : (
                  topics.map((t) => {
                    const isActive = selectedTopicId === t.id;
                    return (
                      <tr
                        key={t.id}
                        className={`cursor-pointer hover:bg-slate-50/70 ${
                          isActive ? "bg-slate-50" : ""
                        }`}
                        onClick={() => handleSelectTopic(t.id)}
                      >
                        <td className="px-4 py-2 text-slate-900">{t.title}</td>
                        <td className="px-4 py-2 text-slate-600">
                          {t.words_count ?? 0}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-500">
              Phiên luyện từ vựng hôm nay
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {practiceSessions ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tổng tất cả học sinh trên hệ thống
            </p>
          </div>

          <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-700">
              Thêm thẻ từ vựng mới
            </p>
            {selectedTopic ? (
              <p className="text-xs text-slate-500">
                Chủ đề đang chọn:{" "}
                <span className="font-medium text-slate-900">
                  {selectedTopic.title}
                </span>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Chọn một chủ đề bên trái để thêm từ vựng.
              </p>
            )}
            <form onSubmit={handleAddWord} className="space-y-2">
              <input
                type="text"
                className="w-full px-3 py-1.5 border rounded text-xs"
                placeholder="Từ vựng (English word)"
                value={wordForm.word}
                onChange={e => handleWordChange("word", e.target.value)}
              />
              <textarea
                className="w-full px-3 py-1.5 border rounded text-xs"
                placeholder="Nghĩa tiếng Việt"
                rows={2}
                value={wordForm.meaning}
                onChange={e => handleWordChange("meaning", e.target.value)}
              />
              <textarea
                className="w-full px-3 py-1.5 border rounded text-xs"
                placeholder="Ví dụ câu (English sentence)"
                rows={2}
                value={wordForm.exampleSentence}
                onChange={e => handleWordChange("exampleSentence", e.target.value)}
              />
              <button
                type="submit"
                disabled={savingWord}
                className="w-full inline-flex justify-center items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
              >
                Lưu thẻ từ vựng
              </button>
            </form>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-600 mb-1">
                Danh sách từ trong chủ đề
              </p>
              {selectedTopicId ? (
                loadingWords ? (
                  <p className="text-xs text-slate-500">Đang tải...</p>
                ) : words.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Chưa có từ vựng trong chủ đề này.
                  </p>
                ) : (
                  <ul className="max-h-40 overflow-y-auto text-xs text-slate-700 space-y-1">
                    {words.map(w => (
                      <li key={w.id}>
                        <span className="font-semibold">{w.word}</span>
                        {w.meaning ? ` — ${w.meaning}` : ""}
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="text-xs text-slate-500">
                  Chọn một chủ đề để xem danh sách từ.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VocabularySection;

