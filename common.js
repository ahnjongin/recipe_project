document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "a5850b5d70524186b8c0";
  const SERVICE_ID = "COOKRCP01";
  const DATA_TYPE = "json";
  let pagesize = 9;
  let totalRecipes = 1124;
  let totalPages = Math.ceil(totalRecipes / pagesize);
  let currentPage = 1;
  let groupSize = 9;

  let currentCategory = "all";
  let currentQuery = null;

  //카테고리 버튼 클릭 시 함수
  const categoryButtons = document.querySelectorAll(".category-item");
  categoryButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const category = e.currentTarget.getAttribute("data-category");
      console.log("Selected category:", category);
      currentCategory = category;
      currentPage = 1;
      createHtml();
      renderPagination();
      fetch("http://localhost:3000/api/data")
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
    });
  });

  const searchButton = document.querySelector(".input button");
  const searchBar = document.querySelector(".search-bar");

  //검색 시 함수
  searchButton.addEventListener("click", () => {
    const query = searchBar.value.trim();
    if (query) {
      currentQuery = query;
      currentCategory = null;
      currentPage = 1;
      createHtml();
      renderPagination();
      fetch("http://localhost:3000/api/data")
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
    }
  });

  // Enter 키로 검색
  searchBar.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchButton.click();
    }
  });

  const fetchRecipes = async (category = "all", query = null, pageNum = 1) => {
    try {
      const startIDX = (pageNum - 1) * pagesize + 1;
      const endIDX = pageNum * pagesize;

      let url = `https://openapi.foodsafetykorea.go.kr/api/${API_KEY}/${SERVICE_ID}/${DATA_TYPE}/${startIDX}/${endIDX}`;

      if (query) {
        url += `/RCP_PARTS_DTLS=${encodeURIComponent(query)}`;
      } else if (category !== "all" && category !== null) {
        url += `/RCP_PAT2=${encodeURIComponent(category)}`;
      }

      console.log("API Request URL:", url);
      const res = await fetch(url);
      const data = await res.json();

      console.log("API Response Data:", data);

      if (data.COOKRCP01 && data.COOKRCP01.row) {
        updateRecipeCount(data.COOKRCP01.total_count);
        return data.COOKRCP01.row;
      } else {
        console.error("No data found in API response");
        updateRecipeCount(0);
        return [];
      }
    } catch (e) {
      console.error(e);

      return [];
    }
  };

  //레시피 개수
  const updateRecipeCount = (count) => {
    const recipeNum = document.querySelector(".recipe-num span");
    recipeNum.innerHTML = count;
  };

  //html 생성함수
  const createHtml = async () => {
    const recipes = await fetchRecipes(
      currentCategory,
      currentQuery,
      currentPage,
    );
    const listCon = document.querySelector(".listCon");
    listCon.innerHTML = "";

    if (Array.isArray(recipes) && recipes.length > 0) {
      recipes.forEach((recipe) => {
        const recipeItem = document.createElement("li");
        recipeItem.className = "recipe-item";

        recipeItem.innerHTML = `
          <a href="detail.html?recipe_id=${recipe.RCP_SEQ}">
            <img src="${recipe.ATT_FILE_NO_MAIN}" alt="${recipe.RCP_NM}" class="recipe-image" />
            <div class="recipe-content">
              <p class="recipe-title">${recipe.RCP_NM}</p>
              <div class="recipe-info">
                <p class="kcal">${recipe.INFO_ENG}kcal</p>
                <p class="food">${recipe.RCP_PAT2}</p>
              </div>
            </div>
          </a>
        `;
        listCon.appendChild(recipeItem);
      });
    } else {
      updateRecipeCount(0);
      console.log("No recipes found.");
      listCon.innerHTML = "<p>레시피를 찾을 수 없습니다.</p>";
    }
  };

  //페이지네이션 함수
  const renderPagination = () => {
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = "";

    const startPage = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    if (startPage > 1) {
      const prevButton = document.createElement("div");
      prevButton.className = "prev";
      prevButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
      prevButton.addEventListener("click", () => {
        currentPage = startPage - 1;
        createHtml();
        renderPagination();
      });
      paginationContainer.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageNumber = document.createElement("span");
      pageNumber.className = "page-number";
      pageNumber.textContent = i;
      if (i === currentPage) {
        pageNumber.classList.add("active");
      }
      pageNumber.addEventListener("click", () => {
        currentPage = i;
        createHtml();
        renderPagination();
      });
      paginationContainer.appendChild(pageNumber);
    }

    if (endPage < totalPages) {
      const nextButton = document.createElement("div");
      nextButton.className = "next";
      nextButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
      nextButton.addEventListener("click", () => {
        currentPage = endPage + 1;
        createHtml();
        renderPagination();
      });
      paginationContainer.appendChild(nextButton);
    }
  };
  createHtml();
  renderPagination();
});
