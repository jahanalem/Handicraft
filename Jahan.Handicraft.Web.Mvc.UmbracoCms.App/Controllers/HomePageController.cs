using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Jahan.Handicraft.Model.UModel;
using Umbraco.Web.Models;

namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.Controllers
{
    public class HomePageController : BaseRenderMvcController<HomePage>
    {
        public override ActionResult Index(RenderModel model)
        {
            //BaseRenderModel<HomePage> instance = new BaseRenderModel<HomePage>(model.Content, model.CurrentCulture);
            ViewBag.PhotoList = Instance.Model.PhotoList;
            ViewBag.HighlightProd = Instance.Model.HighlightProd;
            ViewBag.Banners = Instance.Model.Banners;

            return CurrentTemplate(Instance);
            //return base.Index(Instance);
        }
    }
}