/* ===== dashboard.js =====
   - Loads current user via ittAuth.currentUser()
   - Loads tasks for that user from localStorage key 'itt_tasks_<email>'
   - Renders, adds, toggles complete, deletes, and saves tasks
*/

(function () {
    const qs = (s) => document.querySelector(s);
  
    // Ensure auth helper is available
    if (!window.ittAuth) {
      console.error("ittAuth not loaded. Make sure auth.js is included on this page.");
      return;
    }
  
    // Get logged-in user
    const user = window.ittAuth.currentUser();
    if (!user) {
      // Not logged in => redirect to login page
      window.location.href = "../index.html";
      return;
    }
  
    // Elements
    const userNameEl = qs("#userName");
    const taskInput = qs("#taskInput") || qs("#newTaskInput") || qs("#taskInputHeader");
    const addBtn = qs("#addTaskBtn") || qs("#addTaskButton") || qs("#addTaskBtnHeader");
    const taskList = qs("#taskList");
    const logoutBtn = qs("#logoutBtn");
  
    // ✅ Display the user's name on the dashboard
    if (userNameEl) {
      // Capitalize first letter for a cleaner look
      userNameEl.textContent = user.name.charAt(0).toUpperCase() + user.name.slice(1);
    }
  
    // Storage key per user
    const TASKS_KEY = `itt_tasks_${user.email}`;
  
    // Load tasks
    let tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
  
    function save() {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      render();
    }
  
    function render() {
      if (!taskList) return;
      taskList.innerHTML = "";
  
      if (tasks.length === 0) {
        taskList.innerHTML = `<li style="text-align:center; color:#888;">No tasks yet — add one!</li>`;
        return;
      }
  
      tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.className = t.completed ? "completed" : "";
  
        // Task text
        const left = document.createElement("div");
        left.style.flex = "1";
        left.textContent = t.text;
  
        // Task controls
        const controls = document.createElement("div");
        controls.style.display = "flex";
        controls.style.gap = "8px";
  
        const doneBtn = document.createElement("button");
        doneBtn.textContent = t.completed ? "Undo" : "Done";
        doneBtn.style.padding = "6px 10px";
        doneBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          tasks[i].completed = !tasks[i].completed;
          save();
        });
  
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.background = "#d63031";
        delBtn.style.color = "white";
        delBtn.style.border = "none";
        delBtn.style.padding = "6px 10px";
        delBtn.style.borderRadius = "6px";
        delBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          tasks.splice(i, 1);
          save();
        });
  
        controls.appendChild(doneBtn);
        controls.appendChild(delBtn);
  
        li.appendChild(left);
        li.appendChild(controls);
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "10px";
        li.style.borderRadius = "8px";
        li.style.background = t.completed ? "rgba(0,0,0,0.04)" : "transparent";
  
        taskList.appendChild(li);
      });
    }
  
    // Add task
    if (addBtn && taskInput) {
      addBtn.addEventListener("click", () => {
        const text = (taskInput.value || "").trim();
        if (!text) return;
        tasks.push({ text, completed: false, createdAt: Date.now() });
        taskInput.value = "";
        save();
      });
  
      // Allow pressing Enter to add a task
      taskInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addBtn.click();
        }
      });
    }
  
    // ✅ Logout functionality
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.ittAuth.logout();
        window.location.href = "/index.html";
      });
    }
  
    // Initial render
    render();
  })();
  