using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Jahan.Handicraft.Model.UModel;
using Umbraco.Web.Models;

namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.Controllers
{
    public class ContactUsController : BaseRenderMvcController<ContactUs>
    {
        // GET: ContactUs
        public override ActionResult Index(RenderModel model)
        {
            return CurrentTemplate(Instance);
            //return base.Index(Instance);
        }
    }
}