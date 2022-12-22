function onPageChange() {
    const pageElement = $('#wiki-page-content');
    pageElement.html(''); //TODO: spinner?
    let page = '';
    window.location.hash = `#!${pageType()}/${pageName()}`;
    if (!pageType()&&!pageName()) {
        page = 'pages/home.html';
    } else if (!pageName()) {
        page = `pages/${pageType()}/overview.html`;
    } else {
        page = `pages/${pageType()}/main.html`;
    }
    $.get(page, function(data) {
        pageElement.html(data);
        applyBindings(true);
    });

    const pageElementCustom = $('#wiki-page-custom-content');
    pageElementCustom.html('');
    $.get(`data/${pageType()}/${pageName()}.md`, function(data) {
        pageElementCustom.html(md.render(data));
    });
}

// Setup our markdown editor
const md = new markdownit();
md.renderer.rules.table_open = function(tokens, idx) {
    return '<table class="table table-hover table-striped table-bordered">';
};

// Setup our pages observables
const pageType = ko.observable();
const pageName = ko.observable();
const applyBindings = ko.observable(false);

// Load the page the user is trying to visit
(() => {
    const [ type, name ] = window.location.hash.substr(2).split('/');
    pageType(decodeURI(type || ''));
    pageName(decodeURI(name || ''));
})();

$('document').off('ready');
$(document).ready(() => {
    pageType.subscribe(onPageChange);
    pageName.subscribe(onPageChange);
    applyBindings.subscribe((v) => {
        // This doesn't work as we can only bind to an element once..
        if (v) {
            applyBindings(false);
            ko.applyBindings({}, document.getElementById('wiki-page-content'))
        }
    })

    onPageChange();
    
    ko.applyBindings({}, document.getElementById('nav-bar'));
});

// Save any settings the user has set
window.onbeforeunload = () => {
    Settings.saveDefault();
}

// Map our requirment hints to the requirement
Requirement.prototype.toJSON = function() {
    const req = this.__proto__.constructor.name === 'LazyRequirementWrapper'
        ? this.unwrap()
        : this;

    return {
        ...Object.fromEntries(Object.entries(req)),
        hint: req.hint(),
        __class: req.__proto__.constructor.name,
    };
};

// Custom binds as these aren't loaded
App.game = {
    breeding: new Breeding(),
}

// TODO: Fix these up somehow..
// Overrides, these methods don't work if game not started..
PokemonHelper.getPokemonWandering = () => [];
PokemonHelper.getPokemonDiscord = () => [];


/*
    AUTO FILL FOR SEARCH BAR
*/
const searchOptions = [
    {
        display:'Items',
        type: 'items',
        page: '',
    },
    {
        display:'Pokémon',
        type: 'pokemon',
        page: '',
    },
    ...Object.values(ItemList).map(i => ({
        display: i.displayName,
        type: 'items', 
        page: i.displayName,
    })),
    ...Object.values(pokemonList).map(p => ({
        display: p.name,
        type: 'pokemon',
        page: p.name,
    })),
    ...Object.values(dungeonList).map(d => ({
        display: d.name,
        type: 'dungeons',
        page: d.name,
    })),
];
var substringMatcher = function(searchData) {
  return function findMatches(query, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(query, 'ig');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    searchData.forEach((d, i) => {
      if (substrRegex.test(d.display)) {
        matches.push(d);
      }
    });
    cb(matches);
  };
};

$('#search').typeahead({
  hint: true,
  highlight: true,
  minLength: 1,
  classNames: {
    menu: 'dropdown-menu',
    suggestion: 'dropdown-item',
    cursor: 'active',
  }
},
{
  name: 'Search',
  source: substringMatcher(searchOptions),
  display: 'display',
  templates: {
    notFound: '<a class="dropdown-item disabled">No results found...</a>',
  }
});
$('#search').bind('typeahead:select', function(ev, suggestion) {
    pageType(suggestion.type);
    pageName(suggestion.page);
});
$('#search').bind('typeahead:autocomplete', function(ev, suggestion) {
    pageType(suggestion.type);
    pageName(suggestion.page);
});