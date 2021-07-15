using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Jahan.Handicraft.Model.UModel;
using Jahan.Handicraft.Model.UModel.URenderModel;
using Umbraco.Core.Cache;
using Umbraco.Web.Models;

namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.Controllers
{
    public class ProductsController : BaseRenderMvcController<Products>
    {
        // GET: Products
        public override ActionResult Index(RenderModel model)
        {
            //int page = 1;
            //int.TryParse(Request.QueryString["page"], out page);
            return base.Index(Instance);
        }
    }
}